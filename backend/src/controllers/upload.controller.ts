import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/cloudinary";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma imagem enviada.",
      });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "academia");

    return res.status(200).json({
      success: true,
      url: imageUrl,
    });
  } catch (err: any) {
    console.error("Erro no upload:", err.message);
    return res.status(500).json({
      success: false,
      error: "Erro ao fazer upload da imagem.",
    });
  }
};
