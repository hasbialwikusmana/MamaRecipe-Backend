const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipes");
const likedController = require("../controllers/likes");
const savedController = require("../controllers/saves");
const commentsController = require("../controllers/comments");

const protect = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.get("/", protect, recipesController.getAll);
router.get("/myRecipes", protect, recipesController.getAllMyRecipe);
router.get("/newRecipes", recipesController.getNewRecipes);
router.get("/popularRecipes", recipesController.getPopularRecipes);
router.get("/:id", protect, recipesController.getRecipeById);
router.post("/", protect, upload, recipesController.createRecipe);
router.put("/:id", protect, upload, recipesController.updateRecipe);
router.delete("/:id", protect, recipesController.deleteRecipe);

// FITURE LIKE RECIPE
router.post("/:recipe_id/like", protect, likedController.createLiked);

// FITURE SAVE RECIPE

router.post("/:recipe_id/save", protect, savedController.createSaved);

// FITURE COMMENT RECIPE
router.post("/:recipe_id/comments", protect, commentsController.createComment);

module.exports = router;
