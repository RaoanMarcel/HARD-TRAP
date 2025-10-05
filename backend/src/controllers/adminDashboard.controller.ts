import { Request, Response } from "express";
import {
  getSalesSummaryService,
  getSalesEvolutionService,
  getTopProductsService,
  getOrdersByStatusService,
} from "../services/adminDashboard.service";

export const getDashboard = async (_: Request, res: Response) => {
  try {
    const summary = await getSalesSummaryService();
    const evolution = await getSalesEvolutionService();
    const topProducts = await getTopProductsService();
    const ordersByStatus = await getOrdersByStatusService();

    res.json({ summary, evolution, topProducts, ordersByStatus });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao carregar dashboard", details: err.message });
  }
};