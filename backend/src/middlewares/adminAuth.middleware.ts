import { Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types/authenticatedRequest";

const prisma = new PrismaClient();
 
export const adminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token ausente" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = verify(token, process.env.JWT_SECRET!);

    const user = await prisma.users.findUnique({ where: { id: decoded.userId } });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};