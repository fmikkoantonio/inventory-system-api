import { Request, Response } from "express";

import Product from "../models/Product";
import InventoryLog from "../models/InventoryLog";
import Category from "../models/Category";

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

    const categoryCounts = await Category.find().lean().countDocuments();

    res.status(200).json({
      totalProducts,
      lowStockProducts,
      totalInventoryValue,
      recentActivity,
      totalCategories: categoryCounts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dashboard stats",
    });
  }
};

export const getLowStockProducts = async (_req: Request, res: Response) => {
  try {
    const lowStockProducts = await Product.find({
      quantity: {
        $lt: 5,
      },
    }).populate("category");

    res.status(200).json(lowStockProducts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch low stock products",
    });
  }
};

export const getRecentLogs = async (req: Request, res: Response) => {
  const logs = await InventoryLog.find()
    .populate("product")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json(logs);
};

export const getInventoryValueByCategory = async (
  _req: Request,
  res: Response,
) => {
  const data = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $group: {
        _id: "$category.name",
        value: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },
      },
    },
  ]);

  res.json(data);
};
