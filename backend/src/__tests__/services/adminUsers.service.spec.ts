import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPaymentsService,
  getPaymentByIdService,
  updatePaymentStatusService,
} from "../../services/adminPayments.service";
import { Prisma } from "@prisma/client";

// 🔹 Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    payments: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// importa o prisma mockado
import { prisma } from "../../prisma";

describe("AdminPaymentsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar pagamentos", async () => {
    (prisma.payments.findMany as any).mockResolvedValue([
      {
        id: 1,
        status: "paid",
        amount: new Prisma.Decimal(100),
        user_id: 1,
        order_id: 1,
        method: "card",
        transaction_code: "pi_123",
        created_at: new Date(),
      },
    ]);

    const result = await getPaymentsService();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("paid");
    expect(prisma.payments.findMany).toHaveBeenCalled();
  });

  it("deve buscar pagamento por ID", async () => {
    (prisma.payments.findUnique as any).mockResolvedValue({
      id: 2,
      status: "refunded",
      amount: new Prisma.Decimal(200),
      user_id: 2,
      order_id: 5,
      method: "pix",
      transaction_code: "tx_456",
      created_at: new Date(),
    });

    const result = await getPaymentByIdService(2);
    expect(result?.id).toBe(2);
    expect(result?.status).toBe("refunded");
    expect(prisma.payments.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      include: { user: true, order: true },
    });
  });

  it("deve atualizar status do pagamento", async () => {
    (prisma.payments.update as any).mockResolvedValue({
      id: 3,
      status: "failed",
      amount: new Prisma.Decimal(300),
      user_id: 3,
      order_id: 7,
      method: "boleto",
      transaction_code: "tx_789",
      created_at: new Date(),
    });

    const result = await updatePaymentStatusService(3, "failed", 1);
    expect(result.status).toBe("failed");
    expect(prisma.payments.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { status: "failed" },
    });
  });
});