const { User } = require("../model");

const isAdmin = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) {
      res.status(401);
      throw new Error("unauthorized");
    }
    if (user.role === 1) {
      res.status(403);
      throw new Error("unauthorized");
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isAdmin;
