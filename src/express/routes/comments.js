const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const protect = require("../middlewares/auth");

router.get("/", commentsController.getAll);
router.get("/:id", commentsController.getCommentById);
router.post("/", protect, commentsController.createComment);
router.put("/:id", protect, commentsController.updateComment);
router.delete("/:id", protect, commentsController.deleteComment);

module.exports = router;
