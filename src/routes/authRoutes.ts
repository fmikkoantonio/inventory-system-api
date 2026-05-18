import express from "express";
import { login, register } from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
  });
});

export default router;
