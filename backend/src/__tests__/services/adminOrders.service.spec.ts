import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getOrdersService,
  getOrderByIdService,
  updateOrderStatusService,
} from "../../services/adminOrders.service";

// Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    orders: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    order_status_history: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "../../prisma";

describe("AdminOrdersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar pedidos com filtros", async () => {
    (prisma.orders.findMany as any).mockResolvedValue([
      {
        id: 1,
        status: "pending",
        user: { id: 10, name: "Cliente Teste" },
        order_items: [],
      },
    ]);

    const result = await getOrdersService({ status: "pending" });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("pending");
    expect(prisma.orders.findMany).toHaveBeenCalled();
  });

  it("deve buscar pedido por ID", async () => {
    (prisma.orders.findUnique as any).mockResolvedValue({
      id: 2,
      status: "paid",
      user: { id: 11, name: "Cliente 2" },
      order_items: [],
    });

    const result = await getOrderByIdService(2);
    expect(result?.id).toBe(2);
    expect(result?.status).toBe("paid");
    expect(prisma.orders.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      include: expect.any(Object),
    });
  });

  it("deve atualizar status do pedido e registrar histórico", async () => {
    (prisma.orders.update as any).mockResolvedValue({
      id: 3,
      status: "shipped",
    });

    (prisma.order_status_history.create as any).mockResolvedValue({
      id: 99,
      order_id: 3,
      status: "shipped",
      changed_by: 1,
    });

    const result = await updateOrderStatusService(3, "shipped", 1);

    expect(result.status).toBe("shipped");
    expect(prisma.orders.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { status: "shipped" },
    });
    expect(prisma.order_status_history.create).toHaveBeenCalledWith({
      data: { order_id: 3, status: "shipped", changed_by: 1 },
    });
  });
});