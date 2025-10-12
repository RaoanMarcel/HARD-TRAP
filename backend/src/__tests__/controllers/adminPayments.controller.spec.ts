import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPayments,
  getPaymentById,
  updatePaymentStatus,
} from "../../controllers/adminPayments.controller";
import * as paymentService from "../../services/adminPayments.service";
import * as validation from "../../utils/validation.util";
import { AuthenticatedRequest } from "../../types/authenticatedRequest";
import { Prisma, Role } from "@prisma/client";
import { Response } from "express";

describe("AdminPaymentsController", () => {
  let req: AuthenticatedRequest;
  let res: Response;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: { id: 99, role: Role.ADMIN },
    } as AuthenticatedRequest;

    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.clearAllMocks();
  });

  const mockPayment = {
    id: 1,
    status: "paid",
    amount: new Prisma.Decimal(100),
    user_id: 1,
    order_id: 1,
    method: "card",
    transaction_code: "pi_123",
    created_at: new Date(),
    user: {
      id: 1,
      name: "Admin",
      email: "admin@site.com",
      password_hash: "hashed",
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      resetToken: null,
      resetTokenExpires: null,
    },
    order: {
      id: 1,
      user_id: 1,
      status: "pending",
      total: new Prisma.Decimal(100),
      address_id: null,
      shipping_cost: null,
      shipping_service: null,
      tracking_code: null,
      created_at: new Date(),
    },
  };

  it("deve listar pagamentos", async () => {
    vi.spyOn(paymentService, "getPaymentsService").mockResolvedValue([mockPayment]);

    await getPayments(req, res);

    expect(paymentService.getPaymentsService).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([mockPayment]);
  });

  it("deve buscar pagamento por ID", async () => {
    req.params.id = "1";
    vi.spyOn(paymentService, "getPaymentByIdService").mockResolvedValue(mockPayment);

    await getPaymentById(req, res);

    expect(paymentService.getPaymentByIdService).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(mockPayment);
  });

  it("deve retornar 404 se pagamento não encontrado", async () => {
    req.params.id = "99";
    vi.spyOn(paymentService, "getPaymentByIdService").mockResolvedValue(null);

    await getPaymentById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Pagamento não encontrado",
    });
  });

  it("deve atualizar status do pagamento", async () => {
    req.params.id = "1";
    req.body = { status: "refunded" };

    const updatedPayment = { ...mockPayment, status: "refunded" };

    vi.spyOn(validation, "validateRequest").mockReturnValue({ status: "refunded" });
    vi.spyOn(paymentService, "updatePaymentStatusService").mockResolvedValue(updatedPayment);

    await updatePaymentStatus(req, res);

    expect(paymentService.updatePaymentStatusService).toHaveBeenCalledWith(1, "refunded", 99);
    expect(res.json).toHaveBeenCalledWith(updatedPayment);
  });

  it("deve retornar 400 se validação falhar", async () => {
    req.params.id = "1";
    req.body = { status: "INVALID" };

    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    // 🔹 Força o validateRequest a simular erro
    vi.spyOn(validation, "validateRequest").mockImplementation((_schema, _req, res) => {
      res.status(400).json({
        success: false,
        errors: [{ field: "status", message: "Dados inválidos" }],
      });
      return null;
    });

    await updatePaymentStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ field: "status", message: "Dados inválidos" }],
    });
  });
});