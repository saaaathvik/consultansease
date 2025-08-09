import express from "express";
import argon2 from "argon2";
import nodemailer from "nodemailer";
import LoginModel from "../loginModel.js";

const router = express.Router();

router.post("/get-user", async (req, res) => {
  try {
    const user = await LoginModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const validPassword = await argon2.verify(user.password, req.body.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create-new-user", async (req, res) => {
  try {
    const payload = req.body;

    const userExists = await LoginModel.findOne({ email: payload.email });
    if (userExists) {
      return res.status(400).json({
        message: "Email already exists in our database! Try 'Forgot Password'?",
      });
    }

    const hashedPassword = await argon2.hash(payload.password);

    const newUser = new LoginModel({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/validate-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await LoginModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", user: user });
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const otpStore = new Map();

router.post("/request-otp", async (req, res) => {
  const email = req.body.email;

  const user = await LoginModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found! Try signing up?" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore.set(email, { otp, expiresAt });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "consultansease@gmail.com",
      pass: "tlbl djnc qmtt kqit",
    },
  });

  const mailOptions = {
    from: "ConsultansEase <consultansease@gmail.com>",
    to: email,
    subject: "OTP for Password Reset - ConsultansEase",
    html: `
    <p>Dear User,</p>
    <p>Your OTP for Password Reset is <strong>${otp}</strong>. It is valid for 5 minutes.</p>
    <p>Thanks and Regards,<br>Team ConsultansEase</p>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const stored = otpStore.get(email);

  if (!stored) {
    return res.status(400).json({ message: "No OTP requested!" });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired!" });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ message: "Incorrect OTP!" });
  }

  res.status(200).json({ message: "OTP verified!" });
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await LoginModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const newPassword = await argon2.hash(password);
    user.password = newPassword;
    await user.save();

    otpStore.delete(email);

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
