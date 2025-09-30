import { Request, Response, NextFunction } from "express";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const validateImage = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      error: "Nenhuma imagem enviada.",
    });
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: "Imagem inválida. Envie um arquivo JPG, PNG ou WEBP com até 5MB.",
    });
  }

  if (file.size > MAX_SIZE) {
    return res.status(400).json({
      success: false,
      error: "Imagem inválida. Envie um arquivo JPG, PNG ou WEBP com até 5MB.",
    });
  }

  next();
};
