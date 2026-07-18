import express from "express";

import authMiddleware from "../middleware/authMiddleware";

import { updateStock } from "../controllers/stockController";

const router = express.Router();

/**
 * @swagger
 * /api/stock/{id}:
 *   post:
 *     summary: Update product stock (IN/OUT)
 *     tags:
 *       - Stock
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - quantity
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [IN, OUT]
 *                 description: Stock movement type
 *               quantity:
 *                 type: number
 *                 description: Quantity to add or remove
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 previousQuantity:
 *                   type: number
 *                 currentQuantity:
 *                   type: number
 *       400:
 *         description: Bad request - Insufficient stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post("/:id", authMiddleware, updateStock);

export default router;
