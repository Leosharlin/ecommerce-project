const express = require("express");
const router = express.Router();
const {
  login,
  register,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authcontroller");

router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);
router.post("/resend-verification", resendVerification);
router.get("/verify/:token", verifyEmail);

router.post("/login", login);
router.post("/register", register);

module.exports = router;
