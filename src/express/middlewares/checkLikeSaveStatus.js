const checkLikeSaveStatus = async (req, res, next) => {
  try {
    const recipe = await models.Recipe.findByPk(req.params.recipe_id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.locals.isLiked = recipe.isLiked;
    res.locals.isSaved = recipe.isSaved;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkLikeSaveStatus;
