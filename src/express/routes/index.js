const express = require("express");
const router = express.Router();
const usersRouter = require("./users");
const recipesRouter = require("./recipes");
const commentsRouter = require("./comments");
const likedRouter = require("./liked");
const savedRouter = require("./saved");

router.use("/users", usersRouter);
router.use("/recipes", recipesRouter);
router.use("/comments", commentsRouter);
router.use("/liked", likedRouter);
router.use("/saved", savedRouter);

module.exports = router;
