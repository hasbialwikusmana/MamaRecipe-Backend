const jwt = require("jsonwebtoken");
const generateToken = (payload) => {
  const verifyOpts = {
    // expire 24 jam
    expiresIn: 60 * 60 * 24,
    // issuer: 'tokoku'
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY_JWT, verifyOpts);
  return token;
};

const generateRefreshToken = (payload) => {
  const verifyOpts = {
    // expire 7 hari
    expiresIn: "7d",
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY_JWT, verifyOpts);
  return token;
};
module.exports = { generateToken, generateRefreshToken };
