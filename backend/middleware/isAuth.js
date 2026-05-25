const jwt = require("jsonwebtoken");
const { jwtKey } = require("../config/keys");

const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("token is not provided");
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, jwtKey);
      req.user = decoded;
      next();
    } catch (jwtError) {
      res.status(401);
      throw new Error("invalid or expired token");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = isAuth;
