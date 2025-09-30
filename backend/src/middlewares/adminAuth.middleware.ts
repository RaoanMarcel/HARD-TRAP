import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token ausente" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const user = await prisma.users.findUnique({ where: { id: decoded.userId } });
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acesso negado" });
    }
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};
