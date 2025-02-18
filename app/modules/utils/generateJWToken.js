const jwt = require("jsonwebtoken");
const generateJWToken = async (payload) => {
  var token = jwt.sign({ payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: "5m",
  });
  return token;
};

module.exports = { generateJWToken };
