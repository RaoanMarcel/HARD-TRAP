import { melhorEnvioApi } from "../utils/melhorEnvio";

interface ShippingInput {
  from: string;
  to: string;
  weight: number;
  height: number;
  width: number;
  length: number;
}

export const calculateShippingService = async (data: ShippingInput) => {
  const { from, to, weight, height, width, length } = data;

  if (!from || !to || !weight || !height || !width || !length) {
    throw new Error("Todos os campos são obrigatórios para calcular frete");
  }

  const response = await melhorEnvioApi.post("/me/shipment/calculate", [
    {
      from: { postal_code: from },
      to: { postal_code: to },
      package: { weight, height, width, length },
    },
  ]);

  return response.data;
};
