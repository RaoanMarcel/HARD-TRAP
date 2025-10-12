import { prisma } from "../prisma";
import { Role } from "@prisma/client";


interface UserFilters {
  role?: Role;
  email?: string;
  name?: string;
  skip?: number;
  take?: number;
}

export const getUsersService = async (filters: UserFilters) => {
  return prisma.users.findMany({
    where: {
      role: filters.role,
      email: filters.email
        ? { contains: filters.email, mode: "insensitive" }
        : undefined,
      name: filters.name
        ? { contains: filters.name, mode: "insensitive" }
        : undefined,
    },
    skip: filters.skip,
    take: filters.take,
    orderBy: { createdAt: "desc" },
  });
};

export const getUserByIdService = async (id: number) => {
  return prisma.users.findUnique({
    where: { id },
    include: { orders: true }, // histórico de pedidos
  });
};

export const updateUserService = async (
  id: number,
  data: Partial<{ name: string; email: string; role: Role }>
) => {
  return prisma.users.update({
    where: { id },
    data,
  });
};

export const deleteUserService = async (id: number) => {
  return prisma.users.delete({
    where: { id },
  });
};