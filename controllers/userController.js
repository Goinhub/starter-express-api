const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");
const Card = require("../models/Card");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select("-password");
  res.status(StatusCodes.OK).json({ user });
};

// update user with user.save()
const updateUser = async (req, res) => {
  const { email, name } = req.body;

  const user = await User.findOne({ _id: req.user.userId });
  if (email) {
    user.email = email;
  }
  if (name) {
    user.name = name;
  }

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};

const upgradeUsertopartner = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user.role === "partner") {
    throw new CustomError.BadRequestError("This user is already a partner");
  } else {
    user.role = "partner";
  }

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const deletePartner = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user.role === "user") {
    throw new CustomError.BadRequestError("This user is already a user ");
  } else {
    user.role = "user";
  }

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  upgradeUsertopartner,
  deletePartner,
};

// update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError('Please provide all values');
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
