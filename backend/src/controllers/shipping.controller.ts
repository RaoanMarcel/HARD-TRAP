import { Request, Response } from "express";
import { calculateShippingService } from "../services/shipping.service";

export const calculateShipping = async (req: Request, res: Response) => {
  try {
    const shippingData = req.body;
    const result = await calculateShippingService(shippingData);
    res.json(result);
  } catch (error: any) {
    console.error("Erro ao calcular frete:", error.message || error);
    res.status(500).json({ error: "Falha ao calcular frete" });
  }
};
