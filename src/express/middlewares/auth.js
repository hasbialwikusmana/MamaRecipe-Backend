const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const protect = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
      req.payload = decoded;

      next();
    } else {
      res.status(403).json({
        message: "Please login first",
      });
    }
  } catch (error) {
    console.error(error);

    if (error.name === "JsonWebTokenError") {
      next(new createError(400, "Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      next(new createError(400, "Expired token"));
    } else {
      next(new createError(400, "Token is not valid"));
    }
  }
};

module.exports = protect;
