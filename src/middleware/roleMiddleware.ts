import { Response, NextFunction } from "express";

import { AuthRequest } from "./authMiddleware";

const roleMiddleware =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };

export default roleMiddleware;
