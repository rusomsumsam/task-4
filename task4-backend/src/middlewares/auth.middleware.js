const jwt = require("jsonwebtoken");
const User = require("../models/Users");


const authMiddleware = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: "No web token"
        });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {

        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    if (user.status === "blocked") {

        return res.status(403).json({
            success: false,
            message: "User is blocked"
        });
    }

    req.user = decoded;

    next();
};

module.exports = authMiddleware;