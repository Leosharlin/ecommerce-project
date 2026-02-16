const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const VERIFICATION_WINDOW_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const isStrongPassword = (value) =>
  value.length >= 6 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

const sendVerificationEmail = async (email, token) => {
  const verifyLink = `${FRONTEND_URL}/verify/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Verify your account",
    html: `
      <h3>Verify your account</h3>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyLink}">${verifyLink}</a>
      <p>This link expires in 10 minutes.</p>
    `,
  });
};

const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${FRONTEND_URL}/reset/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Reset your password",
    html: `
      <h3>Password reset request</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 10 minutes.</p>
    `,
  });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ msg: "First name, email and password are required" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        msg: "Password must have min 6 chars, 1 uppercase, 1 lowercase and 1 special character",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpire = Date.now() + VERIFICATION_WINDOW_MS;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationLastSentAt = new Date();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser?.isVerified) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    if (existingUser && !existingUser.isVerified) {
      existingUser.firstName = firstName.trim();
      existingUser.lastName = lastName?.trim() || "";
      existingUser.password = hashedPassword;
      existingUser.verificationToken = verificationToken;
      existingUser.verificationTokenExpire = verificationTokenExpire;
      existingUser.verificationLastSentAt = verificationLastSentAt;
      await existingUser.save();
    } else {
      await User.create({
        firstName: firstName.trim(),
        lastName: lastName?.trim() || "",
        email: cleanEmail,
        password: hashedPassword,
        role: "user",
        isVerified: false,
        verificationToken,
        verificationTokenExpire,
        verificationLastSentAt,
      });
    }

    await sendVerificationEmail(cleanEmail, verificationToken);

    return res.status(201).json({
      msg: "Verification email sent. Please verify your email to complete registration.",
    });
  } catch (err) {
    console.log("Register error:", err);
    return res.status(500).json({ msg: "Unable to register user" });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "Email is already verified" });
    }

    const lastSentAt = user.verificationLastSentAt
      ? new Date(user.verificationLastSentAt).getTime()
      : 0;
    const elapsedMs = Date.now() - lastSentAt;
    if (elapsedMs < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000);
      return res.status(429).json({ msg: `Please wait ${waitSeconds}s before resending` });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + VERIFICATION_WINDOW_MS;
    user.verificationLastSentAt = new Date();
    await user.save();

    await sendVerificationEmail(cleanEmail, verificationToken);
    return res.json({ msg: "Verification email resent successfully" });
  } catch (err) {
    console.log("Resend verify error:", err);
    return res.status(500).json({ msg: "Unable to resend verification email" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired verification link" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    return res.json({ msg: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.log("Verify error:", err);
    return res.status(500).json({ msg: "Unable to verify email" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (user.role !== "admin" && !user.isVerified) {
      return res
        .status(403)
        .json({ msg: "Please verify your email before logging in" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const cleanEmail = req.body.email?.trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Generic response prevents email enumeration
      return res.json({
        msg: "If this email is registered, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendResetPasswordEmail(cleanEmail, token);

    return res.json({
      msg: "If this email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.log("Forgot error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const newPassword = req.body.password || "";
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      msg: "Password must have min 6 chars, 1 uppercase, 1 lowercase and 1 special character",
    });
  }

  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpire: { $gt: Date.now() },
  });

  if (!user) return res.json({ msg: "Invalid or expired token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;

  await user.save();

  res.json({ msg: "Password reset successful" });
};
