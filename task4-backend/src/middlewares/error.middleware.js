const errorMiddleware = (error, req, res, next) => {
    // Duplicate email
    if (error.code === 11000) {

        return res.status(409).json({
            success: false,
            message: "Email already exists"
        });
    }
    
    // Validation error
    if (error.name === "ValidationError") {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: "Server error"
    });
};

module.exports = errorMiddleware;