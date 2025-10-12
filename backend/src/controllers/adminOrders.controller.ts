import { Request, Response } from "express";
import {
  getOrdersService,
  getOrderByIdService,
  updateOrderStatusService,
} from "../services/adminOrders.service";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, customerEmail, customerName, startDate, endDate, skip, take } = req.query;

    const orders = await getOrdersService({
      status: status as string,
      customerEmail: customerEmail as string,
      customerName: customerName as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao listar pedidos", details: err.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const order = await getOrderByIdService(id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao buscar pedido", details: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const adminId = (req as any).user?.id; // vindo do token JWT

    const updated = await updateOrderStatusService(id, status, adminId);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao atualizar status do pedido", details: err.message });
  }
};