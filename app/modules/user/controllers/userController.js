const User = require("../models/userModel");

getAllusers = async (req, res) => {
  // console.log(req.headers);
  try {
    const allUsers = await User.find({}, { __v: 0 });
    res.status(200).json({ data: allUsers });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
module.exports = { getAllusers };
