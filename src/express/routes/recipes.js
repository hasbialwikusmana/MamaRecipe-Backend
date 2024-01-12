const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipes");
const protect = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.get("/", recipesController.getAll);
router.get("/:id", recipesController.getRecipeById);
router.post("/", protect, upload, recipesController.createRecipe);
router.put("/:id", protect, upload, recipesController.updateRecipe);
router.delete("/:id", recipesController.deleteRecipe);

module.exports = router;
