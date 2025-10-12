import { Response } from "express";
import Joi from "joi";
import {
  getPaymentsService,
  getPaymentByIdService,
  updatePaymentStatusService,
} from "../services/adminPayments.service";
import { validateRequest } from "../utils/validation.util";
import { AuthenticatedRequest } from "../types/authenticatedRequest";

// 🔹 Schema de atualização de status
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "paid", "failed", "refunded", "cancelled")
    .required()
    .messages({
      "any.required": "Status é obrigatório",
      "any.only": "Status inválido",
    }),
});

// 🔹 Listar pagamentos
export const getPayments = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await getPaymentsService();
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({
      error: "Erro ao listar pagamentos",
      details: err.message,
    });
  }
};

// 🔹 Buscar pagamento por ID
export const getPaymentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payment = await getPaymentByIdService(id);

    if (!payment) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }

    res.json(payment);
  } catch (err: any) {
    res.status(500).json({
      error: "Erro ao buscar pagamento",
      details: err.message,
    });
  }
};

// 🔹 Atualizar status do pagamento
export const updatePaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  const validated = validateRequest(updateStatusSchema, req, res);
  if (!validated) return;

  try {
    const id = Number(req.params.id);
    const updated = await updatePaymentStatusService(id, validated.status, req.user?.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({
      error: "Erro ao atualizar status do pagamento",
      details: err.message,
    });
  }
};