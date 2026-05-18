import express from "express";

import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

import authMiddleware from "../middleware/authMiddleware";

import roleMiddleware from "../middleware/roleMiddleware";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin"), createProduct);

router.get("/", authMiddleware, getProducts);

router.put("/:id", authMiddleware, roleMiddleware("admin"), updateProduct);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);

export default router;
