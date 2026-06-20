const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\S+@\S+\.\S+$/,
            "Please provide a valid email"
        ]
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },

    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active"
    },

    lastLogin: {
        type: Date,
        default: Date.now
    }

});

const demoSchema = new mongoose.Schema({
    name: String
});

const User = mongoose.model("User", userSchema);
const Demo = mongoose.model("Demo", demoSchema);

module.exports = User;