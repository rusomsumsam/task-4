const User = require('../models/Users');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashPassword
    });

    return apiResponse(res, {
        statusCode: 201,
        message: "User registered successfully",
        data: user
    });
});

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {

        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    const isPassWordMatched = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPassWordMatched) {

        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }


    await User.findByIdAndUpdate(
        user._id,
        {
            lastLogin: new Date()
        }
    );


    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );

    return apiResponse(res, {
        statusCode: 200,
        message: "Login successful",
        data: {
            token
        }
    });
});

module.exports = {
    registerUser,
    loginUser,
}