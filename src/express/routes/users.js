const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const protect = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// get all users
router.get("/users", protect, usersController.getAll);
router.get("/users/profile", protect, usersController.getProfile);
router.get("/users/:id", protect, usersController.getUserById);

// // register & login
router.post("/auth/register", usersController.register);
router.post("/auth/login", usersController.login);

// // refresh token
router.post("/auth/refresh-token", usersController.refreshToken);
// // update profile
router.put("/users/profile/:id", protect, usersController.updateProfile);
// // update image
router.put("/users/profile/:id/image", protect, upload, usersController.updateImage);
// // update password
router.put("/users/profile/:id/password", protect, usersController.updatePassword);
// // delete profile
router.delete("/users/profile/:id", protect, usersController.deleteProfile);

module.exports = router;
