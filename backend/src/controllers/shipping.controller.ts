import { Request, Response } from "express";
import { melhorEnvioApi } from "../utils/melhorEnvio";

export async function calculateShipping(req: Request, res: Response) {
  try {
    const { from, to, weight, height, width, length } = req.body;

    const response = await melhorEnvioApi.post("/me/shipment/calculate", [
      {
        from: { postal_code: from },
        to: { postal_code: to },
        package: {
          weight,
          height,
          width,
          length,
        },
      },
    ]);

    return res.json(response.data);
  } catch (error: any) {
    console.error("Erro ao calcular frete:", error.response?.data || error.message);
    return res.status(500).json({ error: "Falha ao calcular frete" });
  }
}
