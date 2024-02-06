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
router.get("/newRecipes", protect, recipesController.getNewRecipes);
router.get("/popularRecipes", protect, recipesController.getPopularRecipes);
router.get("/likedRecipes", protect, recipesController.getLikeRecipes);
router.get("/savedRecipes", protect, recipesController.getSavesRecipes);
router.get("/:id", protect, recipesController.getRecipeById);
router.post("/", protect, upload, recipesController.createRecipe);
router.put("/:id", protect, upload, recipesController.updateRecipe);
router.delete("/:id", protect, recipesController.deleteRecipe);

// FITURE LIKE RECIPE
router.post("/:recipe_id/like", protect, likedController.createLiked);
router.delete("/:recipe_id/unlike", protect, likedController.unlikeRecipe);
// FITURE SAVE RECIPE

router.post("/:recipe_id/save", protect, savedController.saveRecipe);
router.delete("/:recipe_id/unsave", protect, savedController.unsaveRecipe);

// FITURE COMMENT RECIPE
router.get("/:recipe_id/comments", protect, commentsController.getAllComments);
router.post("/:recipe_id/comments", protect, commentsController.createComment);
router.put("/:recipe_id/comments/:id", protect, commentsController.updateComment);
router.delete("/:recipe_id/comments/:id", protect, commentsController.deleteComment);

module.exports = router;
