const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwtUser = require("../utils/createUserJwt");
const { jwtSec } = require("../config/config");
const sendEmail = require("../utils/sendEmail");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {
  smptService,
  smptMail,
  smptPassword,
  clientUrl,
} = require("../config/config");
const cloudinary = require("cloudinary");
const {
  Types: { ObjectId },
} = require("mongoose");

// register user
exports.registerUser = async (req, res) => {
  try {
    const cloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const { name, email, password } = req.body;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const newUser = User({
        name: name,
        email: email,
        password: hash,
        avatar: {
          public_id: cloud.public_id,
          url: cloud.secure_url,
        },
      });
      await newUser
        .save()
        .then((user) => {
          jwtUser(user, 201, res);
        })
        .catch((error) => {
          res.json({
            success: false,
            message: "User Already Exist",
          });
        });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
};

// user login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!email || !password) {
    return res.send({
      message: "Please enter your email & password",
    });
  }
  if (!user) {
    return res.send({
      message: "Invalid email or password",
    });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.send({
      message: "Incorrect Password",
    });
  }

  jwtUser(user, 200, res);
};

// Logged out user
exports.logoutUser = (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.send({
      success: true,
      message: "User Logout successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const { token } = req.cookies;
  // if (!token) {
  //   return res.status(404).json({
  //     success: false,
  //     message: "You can reset your password after login here",
  //   });
  // }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.send({
        success: false,
        message: "Invalid User!",
      });
    }

    // get password reset token
    let resetToken = user.passwordResettoken();

    await user.save({ validateBeforeSave: false });

    const resetPassworUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;

    const message = `your password reset token is :- \n\n ${resetPassworUrl} \n\nif you are not requsted this email, also ignore it `;
    await sendEmail({
      email: user.email,
      subject: "Mern Stack Ecommerce Website",
      message,
    });
    return res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.send({
      success: false,
      message: "Reset password token is invalid or has been expired!",
    });
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.send({
      success: false,
      message: "Please enter same password!",
    });
  }

  // console.log('req.body.password', req.body.password, "user", user)

  bcrypt.hash(req.body.password, 10).then(async (hash) => {
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    jwtUser(user, 200, res);

    // jwtUser(user, 400, "userController")
  });
};

exports.getUserDetails = async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    const { token } = req.cookies;
    const decodeData = jwt.verify(token, jwtSec);
    const user = await User.findById(decodeData.id);

    return res.status(200).json({
      success: true,
      user,
    });
  }
  return res.status(200).json({
    success: false,
  });
};

// update user password
exports.updateUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { token } = req.cookies;
    const decodeData = jwt.verify(token, jwtSec);
    const user = await User.findById(decodeData.id)
      .select("password")
      .select("+password");

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return res.send({
        message: "Old Password is Incorrect",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.send({
        success: false,
        message: "Password does not match",
      });
    }

    bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
      user.password = hash;
      await user.save();

      jwtUser(user, 200, res);
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
};

exports.userProfileUpdate = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const { token } = req.cookies;
    const decodeData = jwt.verify(token, jwtSec);

    const newUserData = {
      name: name,
      email: email,
    };

    if (req.body.avatar !== "") {
      const user = await User.findById(decodeData.id);

      const imageId = user.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const user = await User.findByIdAndUpdate(decodeData.id, newUserData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Profile Was Updated Successfully",
      user,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

// get all user
exports.getAllUser = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const allUser = await User.find();
    return res.status(200).json({
      success: true,
      message: "Total User " + totalUser,
      allUser,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

// get single user
exports.getSingleUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (ObjectId.isValid(id)) {
      const user = await User.findById(id);
      return res.status(200).json({
        success: true,
        user,
      });
    }

    return res.status(404).json({
      success: false,
      message: "User Not Found!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const id = req.params.id;

    if (ObjectId.isValid(id)) {
      const newUserData = {
        name: name,
        email: email,
        role: role,
      };

      const user = await User.findByIdAndUpdate(id, newUserData, {
        new: true,
      });

      return res.status(200).json({
        success: true,
        message: "Profile Was Updated Successfully",
        user,
      });
    }

    return res.status(404).json({
      success: false,
      message: "User Not Found!",
    });
  } catch (error) {
    return res.send(error.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (ObjectId.isValid(id)) {
      const user = await User.findById(id);

      const imgId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imgId);

      await user.deleteOne();

      return res.status(200).json({
        success: true,
        message: "User Was Delete Successfully",
        user,
      });
    }

    return res.status(404).json({
      success: false,
      message: "User Not Found!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
