import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock dos services
vi.mock("../../services/adminPayments.service", () => ({
  getPaymentsService: vi.fn(),
  getPaymentByIdService: vi.fn(),
  updatePaymentStatusService: vi.fn(),
}));

// 🔹 Mock do validateRequest
vi.mock("../../utils/validation.util", () => ({
  validateRequest: vi.fn(),
}));

import {
  getPaymentsService,
  getPaymentByIdService,
  updatePaymentStatusService,
} from "../../services/adminPayments.service";
import { validateRequest } from "../../utils/validation.util";
import {
  getPayments,
  getPaymentById,
  updatePaymentStatus,
} from "../../controllers/adminPayments.controller";

// 🔹 Criar app Express para testar endpoints isolados
const app = express();
app.use(express.json());
app.get("/admin/payments", getPayments);
app.get("/admin/payments/:id", getPaymentById);
app.put("/admin/payments/:id/status", updatePaymentStatus);

describe("AdminPaymentsController E2E", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar pagamentos", async () => {
    (getPaymentsService as any).mockResolvedValue([
      { id: 1, status: "paid", amount: 100 },
    ]);

    const res = await request(app).get("/admin/payments");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, status: "paid", amount: 100 }]);
  });

  it("deve buscar pagamento por ID", async () => {
    (getPaymentByIdService as any).mockResolvedValue({
      id: 1,
      status: "paid",
      amount: 100,
    });

    const res = await request(app).get("/admin/payments/1");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("paid");
  });

  it("deve retornar 404 se pagamento não encontrado", async () => {
    (getPaymentByIdService as any).mockResolvedValue(null);

    const res = await request(app).get("/admin/payments/99");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Pagamento não encontrado" });
  });

  it("deve atualizar status do pagamento", async () => {
    (validateRequest as any).mockReturnValue({ status: "refunded" });
    (updatePaymentStatusService as any).mockResolvedValue({
      id: 1,
      status: "refunded",
    });

    const res = await request(app)
      .put("/admin/payments/1/status")
      .send({ status: "refunded" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("refunded");
  });

  it("deve retornar 400 se validação falhar", async () => {
    (validateRequest as any).mockImplementation((_schema: any, _req: any, res: any) => {
      res.status(400).json({
        success: false,
        errors: [{ field: "validation", message: "Dados inválidos" }],
      });
      return null;
    });

    const res = await request(app)
      .put("/admin/payments/1/status")
      .send({ status: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      errors: [{ field: "validation", message: "Dados inválidos" }],
    });
  });
});