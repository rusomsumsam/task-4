const User = require("../models/Users");
const apiResponse = require("../utils/apiResponse");


const getAllUsers = async (req, res) => {

    try {

        const users = await User.find().sort({
            lastLogin: -1
        });

        return apiResponse(res, {
            statusCode: 200,
            message: "Users fetched successfully",
            data: users
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const blockUser = async (req, res) => {

    try {

        const { userId } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                status: "blocked"
            },
            {
                new: true
            }
        );

        if (!user) {

            return apiResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found"
            });
        }

        const isCurrentUserBlocked =
            req.user.userId === user._id.toString();

        return apiResponse(res, {
            statusCode: 200,
            message: "User blocked successfully",
            data: {
                user,
                logout: isCurrentUserBlocked
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const unblockUser = async (req, res) => {

    try {

        const { userId } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                status: "active"
            },
            {
                new: true
            }
        );

        if (!user) {

            return apiResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found"
            });
        }

        return apiResponse(res, {
            statusCode: 200,
            message: "User unblocked successfully",
            data: {
                user
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const deleteUser = async (req, res) => {

    try {

        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isCurrentUserDeleted =
            req.user.userId === id;

        return apiResponse(res, {
            statusCode: 200,
            message: "User deleted successfully",
            data: {
                logout: isCurrentUserDeleted
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const bulkBlockUsers = async (req, res) => {

    try {

        const { userIds } = req.body; 
        
        if (!userIds || userIds.length === 0) {

            return apiResponse(res, {
                statusCode: 400,
                success: false,
                message: "No users selected"
            });
        }

        await User.updateMany(
            {
                _id: { $in: userIds }
            },
            {
                status: "blocked"
            }
        );

        const shouldLogout = userIds.includes(req.user.userId);

        return apiResponse(res, {
            statusCode: 200,
            message: "Users blocked successfully",
            data: {
                logout: shouldLogout
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const bulkUnblockUsers = async (req, res) => {

    try {

        const { userIds } = req.body;

        await User.updateMany(
            {
                _id: { $in: userIds }
            },
            {
                status: "active"
            }
        );

        return apiResponse(res, {
            statusCode: 200,
            message: "Users unblocked successfully"
        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const bulkDeleteUsers = async (req, res) => {

    try {

        const { userIds } = req.body;

        await User.deleteMany({
            _id: { $in: userIds }
        });

        const shouldLogout = userIds.includes(req.user.userId);

        return apiResponse(res, {
            statusCode: 200,
            message: "Users deleted successfully",
            data: {
                logout: shouldLogout
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getAllUsers,
    blockUser,
    unblockUser,
    deleteUser,
    bulkBlockUsers,
    bulkUnblockUsers,
    bulkDeleteUsers
};