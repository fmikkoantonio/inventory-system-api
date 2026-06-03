import { Request, Response } from "express";
import Category from "../models/Category";

export const createCategory = async (req: Request, res: Response) => {
  const category = await Category.create(req.body);

  res.status(201).json(category);
};

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await Category.find();

  res.status(200).json(categories);
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Category deleted",
  });
};
