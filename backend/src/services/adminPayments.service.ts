import { prisma } from "../prisma";

// 🔹 Listar pagamentos com filtros opcionais
export const getPaymentsService = async () => {
  return await prisma.payments.findMany({
    include: {
      user: true,
      order: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

// 🔹 Buscar pagamento por ID
export const getPaymentByIdService = async (id: number) => {
  return await prisma.payments.findUnique({
    where: { id },
    include: {
      user: true,
      order: true,
    },
  });
};

// 🔹 Atualizar status do pagamento (manual)
export const updatePaymentStatusService = async (
  id: number,
  status: string,
  adminId?: number
) => {
  return await prisma.payments.update({
    where: { id },
    data: { status },
  });
};