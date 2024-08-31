const express = require("express");
const router = express.Router();
const usersRouter = require("./users");
const recipesRouter = require("./recipes");
const commentsRouter = require("./comments");
const likedRouter = require("./likes");
const savedRouter = require("./saves");

router.get("/", (req, res) => {
  res.send("The server is up and running smoothly.");
});

router.use("/", usersRouter);
router.use("/recipes", recipesRouter);
router.use("/comments", commentsRouter);
router.use("/likes", likedRouter);
router.use("/saves", savedRouter);

module.exports = router;
