import { Request, Response, NextFunction } from "express";

const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
};

export default errorMiddleware;
