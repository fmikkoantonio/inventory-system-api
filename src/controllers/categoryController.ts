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
