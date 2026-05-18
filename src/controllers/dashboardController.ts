import { Request, Response } from "express";

import Product from "../models/Product";
import InventoryLog from "../models/InventoryLog";

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();

    const lowStockProducts = await Product.countDocuments({
      quantity: {
        $lt: 10,
      },
    });

    const products = await Product.find();

    const totalInventoryValue = products.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);

    const recentActivity = await InventoryLog.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .populate("product");

    res.status(200).json({
      totalProducts,
      lowStockProducts,
      totalInventoryValue,
      recentActivity,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dashboard stats",
    });
  }
};
