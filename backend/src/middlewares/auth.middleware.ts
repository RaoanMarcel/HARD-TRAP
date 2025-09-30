import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface JwtPayload {
  userId: number;
  email: string;
  role: Role; 
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1]; 
  if (!token) {
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    const secret = process.env.JWT_SECRET || "supersecret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Add logging to debug token verification
    console.log("Authorization Header:", authHeader);
    console.log("Decoded Token:", decoded);

    (req as AuthRequest).user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido ou expirado" });
  }
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
};

export const authorize =
  (roles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    next();
  };

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== Role.ADMIN) { 
    return res.status(403).json({ error: "Acesso negado: apenas administradores" });
  }
  next();
};
