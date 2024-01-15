const express = require("express");
const router = express.Router();
const usersRouter = require("./users");
const recipesRouter = require("./recipes");
const commentsRouter = require("./comments");
const likedRouter = require("./likes");
const savedRouter = require("./saves");

router.use("/", usersRouter);
router.use("/recipes", recipesRouter);
router.use("/comments", commentsRouter);
router.use("/likes", likedRouter);
router.use("/saves", savedRouter);

module.exports = router;
