import { prisma } from "../prisma";

interface OrderFilters {
  status?: string;
  customerEmail?: string;
  customerName?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

export const getOrdersService = async (filters: OrderFilters) => {
  return prisma.orders.findMany({
    where: {
      status: filters.status,
      user: {
        email: filters.customerEmail
          ? { contains: filters.customerEmail, mode: "insensitive" }
          : undefined,
        name: filters.customerName
          ? { contains: filters.customerName, mode: "insensitive" }
          : undefined,
      },
      created_at: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    },
    skip: filters.skip,
    take: filters.take,
    orderBy: { created_at: "desc" },
    include: {
      user: true,
      order_items: { include: { product: true } },
      payments: true,
      address: true,
      status_logs: true,
    },
  });
};

export const getOrderByIdService = async (id: number) => {
  return prisma.orders.findUnique({
    where: { id },
    include: {
      user: true,
      order_items: { include: { product: true } },
      payments: true,
      address: true,
      status_logs: true,
    },
  });
};

export const updateOrderStatusService = async (
  id: number,
  status: string,
  adminId?: number
) => {
  const updated = await prisma.orders.update({
    where: { id },
    data: { status },
  });

  // registra histórico
  await prisma.order_status_history.create({
    data: {
      order_id: id,
      status,
      changed_by: adminId,
    },
  });

  return updated;
};