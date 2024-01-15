const express = require("express");
const router = express.Router();
const likedController = require("../controllers/liked");
const protect = require("../middlewares/auth");

router.get("/", protect, likedController.getAll);
router.get("/:id", protect, likedController.getLikedById);

module.exports = router;
