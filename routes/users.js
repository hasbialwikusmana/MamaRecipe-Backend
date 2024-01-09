const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/profile", usersController.profile);

// // update profile
// router.put("/profile/:id", usersController.updateProfile);
// // update image
// router.put("/profile/:id/image", usersController.updateimage);
// // update password
// router.put("/profile/:id/password", usersController.updatePassword);
// // delete profile
// router.delete("/profile/:id", usersController.deleteProfile);

module.exports = router;
