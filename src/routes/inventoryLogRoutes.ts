import express from "express";

import authMiddleware from "../middleware/authMiddleware";

import InventoryLog from "../models/InventoryLog";

const router = express.Router();

/**
 * @swagger
 * /api/inventory-logs:
 *   get:
 *     summary: Get all inventory logs
 *     tags:
 *       - Inventory Logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   product:
 *                     type: object
 *                     description: Populated product details
 *                   action:
 *                     type: string
 *                     description: Action performed (e.g., UPDATE)
 *                   previousQuantity:
 *                     type: number
 *                   newQuantity:
 *                     type: number
 *                   changedBy:
 *                     type: object
 *                     description: Populated user details
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch inventory logs
 */
router.get("/", authMiddleware, async (_req, res) => {
  try {
    const logs = await InventoryLog.find()
      .populate("product")
      .populate("changedBy")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(logs);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch inventory logs",
    });
  }
});

export default router;
