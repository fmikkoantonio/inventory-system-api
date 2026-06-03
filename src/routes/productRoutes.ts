import express from "express";

import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/productController";

import authMiddleware from "../middleware/authMiddleware";

import roleMiddleware from "../middleware/roleMiddleware";

import upload from "../config/multer";

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  createProduct,
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   sku:
 *                     type: string
 *                   description:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   price:
 *                     type: number
 *                   category:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [ACTIVE, DELETED]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags:
 *       - Products
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
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DELETED]
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  updateProduct,
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Product not found
 */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);

router.get("/:id", authMiddleware, getProductById);

export default router;
