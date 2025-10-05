import { prisma } from "../prisma";

// Resumo de vendas
export const getSalesSummaryService = async () => {
  const totalOrders = await prisma.orders.count();
  const totalRevenue = await prisma.orders.aggregate({ _sum: { total: true } });
  const avgTicket = await prisma.orders.aggregate({ _avg: { total: true } });

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    avgTicket: avgTicket._avg.total || 0,
  };
};

// Evolução de vendas (últimos 30 dias)
export const getSalesEvolutionService = async () => {
  const sales = await prisma.orders.groupBy({
    by: ["created_at"],
    _sum: { total: true },
    orderBy: { created_at: "asc" },
  });

  return sales.map((s) => ({
    date: s.created_at,
    total: s._sum.total || 0,
  }));
};

// Produtos mais vendidos
export const getTopProductsService = async () => {
  const topProducts = await prisma.order_items.groupBy({
    by: ["product_id"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const products = await prisma.product.findMany({
    where: { id: { in: topProducts.map((p) => p.product_id) } },
  });

  return topProducts.map((tp) => ({
    product: products.find((p) => p.id === tp.product_id),
    quantity: tp._sum.quantity || 0,
  }));
};

// Pedidos em andamento por status
export const getOrdersByStatusService = async () => {
  const grouped = await prisma.orders.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return grouped.map((g) => ({
    status: g.status,
    count: g._count.status,
  }));
};