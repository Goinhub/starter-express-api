const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  contactus,
  sendResetPasswordEmail,
  createHash,
} = require("../utils");
const crypto = require("crypto");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });
  const origin = "https://goihub-client.vercel.app/auth";

  // const tempOrigin = req.get('origin');
  // const protocol = req.protocol;
  // const host = req.get('host');
  // const forwardedHost = req.get('x-forwarded-host');
  // const forwardedProtocol = req.get('x-forwarded-proto');

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin: origin,
  });
  // send verification token back only while testing in postman!!!
  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify account",
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification Failed user");
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification Failed token");
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your account");
  }
  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = "";
  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return res.status(StatusCodes.OK).json({ user: tokenUser });
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Please provide valid email");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");
    // send email

    const origin = "https://goihub-client.vercel.app/auth";
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password link" });
};
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
      return res.status(200).json({ msg: "Password changed successfully" });
    }
  }

  throw new CustomError.BadRequestError("Invalid token");
};
const contactuscon = async (req, res) => {
  const { email, name, message } = req.body;
  await contactus({
    name: name,
    email: email,
    message: message,
  });
  res.status(StatusCodes.OK).json({ msg: "message sent" });
};

const facebookSignin = async (req, res) => {
  const { userID, accessToken } = req.body;
  const urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
  const { data } = await axios.get(urlGraphFacebook);
  const { email, name } = data;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: crypto.randomBytes(20).toString("hex"),
      role: "user",
    });
  }
  const tokenUser = createTokenUser(user);
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const googleSignin = async (req, res) => {
  const { tokenId } = req.body;
  const response = await axios.post(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`
  );
  const { email_verified, name, email } = response.data;
  if (email_verified) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(20).toString("hex"),
        role: "user",
      });
    }
    const tokenUser = createTokenUser(user);
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const userToken = { refreshToken, ip, userAgent, user: user._id };

    await Token.create(userToken);

    attachCookiesToResponse({ res, user: tokenUser, refreshToken });

    res.status(StatusCodes.OK).json({ user: tokenUser });
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  contactuscon,
  forgotPassword,
  resetPassword,
  facebookSignin,
  googleSignin,
};
