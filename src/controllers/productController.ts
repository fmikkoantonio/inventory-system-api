import { Request, Response } from "express";
import Product from "../models/Product";
import InventoryLog from "../models/InventoryLog";
import { AuthRequest } from "../middleware/authMiddleware";
import { createProductSchema } from "../validators/productValidator";
import { ZodError } from "zod";
import StockTransaction from "../models/StockTransaction";

export const createProduct = async (req: any, res: Response) => {
  try {
    createProductSchema.parse(req.body);

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      ...req.body,
      image,
    });

    if (product.quantity > 0) {
      await StockTransaction.create({
        product: product._id,
        quantity: product.quantity,
        type: "IN",
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";

    const category = req.query.category || "";

    const skip = (page - 1) * limit;

    const query: any = {};

    // Search by product name
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .populate("category");

    const total = await Product.countDocuments(query);

    res.status(200).json({
      data: products,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const previousQuantity = existingProduct.quantity;

    // Handle image upload if present
    const updateData = { ...req.body };
    if ((req as any).file) {
      updateData.image = `/uploads/${(req as any).file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Only log if quantity changed
    if (previousQuantity !== updatedProduct.quantity) {
      await InventoryLog.create({
        product: existingProduct._id,
        action: "UPDATE",
        previousQuantity,
        newQuantity: updatedProduct.quantity,
        changedBy: req.user.id,
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error(error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "SKU already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate("category");

  res.status(200).json(product);
};
