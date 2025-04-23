const User = require("../modules/user/models/userModel");

module.exports = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (user.role !== requiredRole) {
        return res
          .status(403)
          .json({ error: "Access denied. Unauthorized role." });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
