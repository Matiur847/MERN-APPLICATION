const { jwtSec, jwtExp, nodeEnv } = require("../config/config");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// create jwtToken or save is cookie
const jwtUser = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, jwtSec, {
    expiresIn: jwtExp,
  });

  // create cookie option
  const options = {
    expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = jwtUser;
