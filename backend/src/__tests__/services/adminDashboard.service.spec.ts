import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../prisma";
import {
  getSalesSummaryService,
  getSalesEvolutionService,
  getTopProductsService,
  getOrdersByStatusService,
} from "../../services/adminDashboard.service";

// Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    orders: {
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    order_items: {
      groupBy: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe("Admin Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar resumo de vendas", async () => {
    (prisma.orders.count as any).mockResolvedValue(10);
    (prisma.orders.aggregate as any)
      .mockResolvedValueOnce({ _sum: { total: 1000 } })
      .mockResolvedValueOnce({ _avg: { total: 100 } });

    const result = await getSalesSummaryService();

    expect(result).toEqual({
      totalOrders: 10,
      totalRevenue: 1000,
      avgTicket: 100,
    });
  });

  it("deve retornar evolução de vendas", async () => {
    (prisma.orders.groupBy as any).mockResolvedValue([
      { created_at: new Date("2025-10-01"), _sum: { total: 500 } },
    ]);

    const result = await getSalesEvolutionService();

    expect(result).toEqual([
      { date: new Date("2025-10-01"), total: 500 },
    ]);
  });

  it("deve retornar produtos mais vendidos", async () => {
    (prisma.order_items.groupBy as any).mockResolvedValue([
      { product_id: 1, _sum: { quantity: 5 } },
    ]);
    (prisma.product.findMany as any).mockResolvedValue([
      { id: 1, name: "Produto Teste" },
    ]);

    const result = await getTopProductsService();

    expect(result).toEqual([
      { product: { id: 1, name: "Produto Teste" }, quantity: 5 },
    ]);
  });

  it("deve retornar pedidos agrupados por status", async () => {
    (prisma.orders.groupBy as any).mockResolvedValue([
      { status: "pending", _count: { status: 3 } },
    ]);

    const result = await getOrdersByStatusService();

    expect(result).toEqual([{ status: "pending", count: 3 }]);
  });
});