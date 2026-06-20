const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
    getAllUsers,
    blockUser,
    unblockUser,
    deleteUser,
    bulkBlockUsers,
    bulkUnblockUsers,
    bulkDeleteUsers
} = require("../controllers/user.controller");

router.get(
    "/",
    authMiddleware,
    getAllUsers
);

router.patch(
    "/block",
    authMiddleware,
    blockUser
);

router.patch(
    "/unblock",
    authMiddleware,
    unblockUser
);

router.delete(
    "/:id",
    authMiddleware,
    deleteUser
);

router.patch(
    "/bulk-block",
    authMiddleware,
    bulkBlockUsers
);

router.patch(
    "/bulk-unblock",
    authMiddleware,
    bulkUnblockUsers
);

router.post(
    "/bulk-delete",
    authMiddleware,
    bulkDeleteUsers
);

module.exports = router;