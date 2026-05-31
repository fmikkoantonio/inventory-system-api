import express from "express";

import { getDashboardStats } from "../controllers/dashboardController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: number
 *                   description: Total number of products
 *                 lowStockProducts:
 *                   type: number
 *                   description: Products with quantity less than 10
 *                 totalInventoryValue:
 *                   type: number
 *                   description: Total value of all inventory
 *                 recentActivity:
 *                   type: array
 *                   description: Last 5 inventory log entries
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, getDashboardStats);

export default router;
