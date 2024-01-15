const express = require("express");
const router = express.Router();
const savedController = require("../controllers/saves");
const protect = require("../middlewares/auth");

router.get("/", protect, savedController.getAll);
router.get("/:id", protect, savedController.getSavedById);
module.exports = router;
