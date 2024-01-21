const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  try {
    const verifyOpts = {
      expiresIn: "1d",
      issuer: "mamarecipe_backend",
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY_JWT, verifyOpts);
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

const generateRefreshToken = (payload) => {
  try {
    const verifyOpts = { expiresIn: "1 day" };
    const token = jwt.sign(payload, process.env.SECRET_KEY_JWT, verifyOpts);
    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw error;
  }
};

const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, process.env.SECRET_KEY_JWT);
};

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken };
