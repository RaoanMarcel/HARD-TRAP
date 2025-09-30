import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Muitas tentativas. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Muitas tentativas. Tente novamente mais tarde.",
    });
  },
});

// 🔹 Limite de requisições para recuperação de senha: 3 por 30 minutos
export const forgotPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 3,
  message: { success: false, error: "Muitas tentativas. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Muitas tentativas. Tente novamente mais tarde.",
    });
  },
});
