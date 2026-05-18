import express from "express";

import { getDashboardStats } from "../controllers/dashboardController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getDashboardStats);

export default router;
