const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipes");
const likedController = require("../controllers/likes");
const savedController = require("../controllers/saves");
const commentsController = require("../controllers/comments");

const protect = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const checkLikeSaveStatus = require("../middlewares/checkLikeSaveStatus");

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
router.post("/:recipe_id/like", protect, checkLikeSaveStatus, likedController.likeRecipe);
// FITURE SAVE RECIPE

router.post("/:recipe_id/save", protect, checkLikeSaveStatus, savedController.saveRecipe);

// FITURE COMMENT RECIPE
router.get("/:recipeId/comments", protect, commentsController.getAllComments);
router.post("/:recipeId/comments", protect, commentsController.createComment);
router.put("/:recipeId/comments/:id", protect, commentsController.updateComment);
router.delete("/:recipeId/comments/:id", protect, commentsController.deleteComment);

module.exports = router;
