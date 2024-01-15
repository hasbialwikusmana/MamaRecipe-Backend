const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const protect = require("../middlewares/auth");

router.get("/", protect, commentsController.getAll);
router.get("/:id", protect, commentsController.getCommentById);
router.put("/:id", protect, commentsController.updateComment);
router.delete("/:id", protect, commentsController.deleteComment);

module.exports = router;
