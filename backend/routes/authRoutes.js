import express from "express";
import {
  registerUser,
  loginUser,
  verifyFace,
//   verifyWallet
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-face", verifyFace);
router.get("/test", (req, res) => {
  res.json({ message: "AUTH ROUTES WORK!" });
});

// router.post("/verify-wallet", verifyWallet);

export default router;
