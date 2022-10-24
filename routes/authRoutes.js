const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/auth");

const {
  register,
  login,
  logout,
  verifyEmail,
  contactuscon,
  forgotPassword,
  resetPassword,
  facebookSignin,
  googleSignin,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/contactus", contactuscon);
router.post("/login", login);
router.delete("/logout", authenticateUser, logout);
router.post("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/google-signin", googleSignin);
router.post("/facebook-signin", facebookSignin);

module.exports = router;
