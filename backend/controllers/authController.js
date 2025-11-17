import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerUser = async (req, res) => {
  try {
    const { name, email, contact, password, walletAddress, photos } = req.body;

    /* Step 0: Prevent duplicate wallet registration */
    const existingWallet = await User.findOne({ walletAddress });
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        error:
          "This wallet is already registered. Please switch MetaMask account.",
      });
    }

    if (!photos || photos.length < 3) {
      return res.status(400).json({ error: "Three photos required." });
    }

    /* Step 1: Create Voter ID */
    const voterId = email.split("@")[0] + "_" + Date.now();

    /* Step 2: Create dataset folder */
    const voterDatasetPath = path.join(__dirname, "..", "dataset", email);
    fs.mkdirSync(voterDatasetPath, { recursive: true });

    /* Step 3: Save images */
    photos.forEach((img, i) => {
      const buffer = Buffer.from(
        img.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      fs.writeFileSync(path.join(voterDatasetPath, `${i}.jpg`), buffer);
    });

    /* Step 4: Run Python encoding */
    const encodeScript = path.join(
      __dirname,
      "..",
      "python",
      "feature_encoding.py"
    );

    execSync(`py -3.10 "${encodeScript}" ${email}`, { stdio: "inherit" });

    const faceEncodingPath = `encodings/${email}_face_recognition.npy`;
    const robustEncodingPath = `encodings/${email}_robust.npy`;

    /* Step 5: Save user in DB */
    await User.create({
      voterId,
      name,
      email,
      contact,
      password,
      walletAddress,
      faceEncodingFile: faceEncodingPath,
      robustEncodingFile: robustEncodingPath,
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      voterId,
    });
  } catch (err) {
    console.log("❌ Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: username }, { voterId: username }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    return res.json({
      success: true,
      voterId: user.voterId,
      wallet: user.walletAddress,
    });
  } catch (err) {
    console.log("❌ Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

/* ============================================================
   VERIFY FACE (Python call)
============================================================ */
export const verifyFace = async (req, res) => {
  try {
    const { voterId, image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image required" });
    }

    const tempDir = path.join(__dirname, "..", "temp");
    fs.mkdirSync(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, `${voterId}.jpg`);

    /* Save Base64 image */
    const buffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    fs.writeFileSync(tempPath, buffer);
    console.log("received buffer size:", buffer.length);

    const verifyScript = path.join(
      __dirname,
      "..",
      "python",
      "face_recog.py"
    );

    let output;
    try {
      output = execSync(`py -3.10 "${verifyScript}" ${voterId}`, {
        encoding: "utf8",
      });
    } catch (err) {
      console.log("❌ Python Verification Error");
      return res.json({ success: false, confidence: 0 });
    }

    console.log("Python Output:", output);

    if (output.includes("SUCCESS")) {
      return res.json({ success: true, confidence: 100 });
    } else {
      return res.json({ success: false, confidence: 0 });
    }
  } catch (err) {
    console.log("❌ Face Verify Error:", err);
    res.status(500).json({ error: "Face verification failed" });
  }
};

export const checkWalletExists = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.json({ exists: false });
    }

    const user = await User.findOne({ walletAddress });

    if (user) return res.json({ exists: true });
    return res.json({ exists: false });
  } catch (err) {
    console.log("❌ Wallet Check Error:", err);
    res.json({ exists: false });
  }
};
