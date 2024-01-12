const express = require("express");
const router = express.Router();
const savedController = require("../controllers/saved");
const protect = require("../middlewares/auth");

router.get("/", savedController.getAll);
router.get("/:id", savedController.getSavedById);
router.post("/", protect, savedController.createSaved);
router.delete("/:id", protect, savedController.deleteSaved);

module.exports = router;
