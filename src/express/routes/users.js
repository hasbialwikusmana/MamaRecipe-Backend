const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const protect = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.get("/", usersController.getAll);
router.get("/:id", usersController.getUserById);
router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/profile", protect, usersController.profile);

// // update profile
router.put("/profile/:id", protect, usersController.updateProfile);
// // update image
router.put("/profile/:id/image", upload, usersController.updateImage);
// // update password
// router.put("/profile/:id/password", usersController.updatePassword);
// // delete profile
// router.delete("/profile/:id", usersController.deleteProfile);

module.exports = router;
