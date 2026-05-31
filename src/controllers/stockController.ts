import { Response } from "express";

import Product from "../models/Product";
import StockTransaction from "../models/StockTransaction";

import { AuthRequest } from "../middleware/authMiddleware";

export const updateStock = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { type, quantity } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const previousQuantity = product.quantity;

  if (type === "IN") {
    product.quantity += quantity;
  }

  if (type === "OUT") {
    if (product.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    product.quantity -= quantity;
  }

  await product.save();

  await StockTransaction.create({
    product: product._id,
    type,
    quantity,
    performedBy: req.user.id,
  });

  res.status(200).json({
    previousQuantity,
    currentQuantity: product.quantity,
  });
};
