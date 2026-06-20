const express = require('express');

const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

const {User, Demo} = require('../models/Users');

// Protected Route
router.get(
    '/protected',
    authMiddleware,
    async (req, res) => {

        const userId = req.user.userId;

        const user = await User.findById(userId);

        res.json({
            success: true,
            message: "Protected route accessed",
            user
        });
    }
);

router.get(
    '/demo',
    async (req, res) => {
        const demo = await Demo.find();
        res.json({
            demo
        })
    }
);

const authRoute = require('./auth.routes');
const userRoutes = require('./user.routes');

router.use('/auth', authRoute);

router.use('/users', userRoutes);

module.exports = router;