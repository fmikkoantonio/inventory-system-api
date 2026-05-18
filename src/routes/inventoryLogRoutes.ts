import express from "express";

import authMiddleware from "../middleware/authMiddleware";

import InventoryLog from "../models/InventoryLog";

const router = express.Router();

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
