const express = require("express");
const router = express.Router();
const likedController = require("../controllers/liked");
const protect = require("../middlewares/auth");

router.get("/", likedController.getAll);
router.get("/:id", likedController.getLikedById);
router.post("/", protect, likedController.createLiked);
router.delete("/:id", protect, likedController.deleteLiked);

module.exports = router;
