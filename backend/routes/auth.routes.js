import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, contact, password, walletAddress } = req.body;

    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ error: "User already exists" });

    user = new User({
      name,
      email,
      contact,
      password,
      walletAddress,
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful",
      user,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    let user;

    if (email && password) {
      user = await User.findOne({ email, password });
      if (!user)
        return res.status(401).json({ error: "Invalid email or password" });

    } else if (walletAddress) {
      user = await User.findOne({ walletAddress });
      if (!user)
        return res.status(401).json({ error: "Wallet not registered" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
