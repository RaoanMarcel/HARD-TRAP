import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/mailer";
import { Role } from "@prisma/client";

// 🔹 Listar usuários
export const getAllUsers = async () => {
  console.info("[getAllUsers] Buscando todos os usuários");
  const users = await prisma.users.findMany({
    select: { id: true, name: true, email: true, role: true },
  });

  if (!users.length) {
    console.warn("[getAllUsers] Nenhum usuário encontrado");
    throw new Error("Nenhum usuário encontrado");
  }

  console.info("[getAllUsers] Usuários encontrados", { count: users.length });
  return users;
};

// 🔹 Buscar usuário por ID
export const getUserByIdService = async (id: number) => {
  console.info("[getUserByIdService] Buscando usuário", { userId: id });
  const user = await prisma.users.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    console.warn("[getUserByIdService] Usuário não encontrado", { userId: id });
    throw new Error("Usuário não encontrado");
  }

  console.info("[getUserByIdService] Usuário encontrado", { userId: id });
  return user;
};

// 🔹 Atualizar usuário
export const updateUserService = async (
  id: number,
  data: { name?: string; email?: string; role?: string }
) => {
  console.info("[updateUserService] Atualizando usuário", { userId: id, updates: data });

  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) {
    console.warn("[updateUserService] Usuário não encontrado", { userId: id });
    throw new Error("Usuário não encontrado");
  }

  const updateData: { name?: string; email?: string; role?: Role } = {
    name: data.name,
    email: data.email,
  };

  if (data.role) {
    if (!Object.values(Role).includes(data.role as Role)) {
      console.error("[updateUserService] Role inválido", { role: data.role });
      throw new Error("Role inválido");
    }
    updateData.role = data.role as Role;
  }

  const updatedUser = await prisma.users.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true },
  });

  console.info("[updateUserService] Usuário atualizado com sucesso", { userId: id });
  return updatedUser;
};

// 🔹 Deletar usuário
export const deleteUserService = async (id: number, confirmName: string) => {
  console.info("[deleteUserService] Iniciando exclusão de usuário", { userId: id, confirmName });

  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) {
    console.warn("[deleteUserService] Usuário não encontrado", { userId: id });
    throw new Error("Usuário não encontrado");
  }
  if (user.name !== confirmName) {
    console.warn("[deleteUserService] Nome informado não confere", {
      userId: id,
      expected: user.name,
      received: confirmName,
    });
    throw new Error("Nome informado não confere. Exclusão cancelada.");
  }

  await prisma.$transaction(async (tx) => {
    const orders = await tx.orders.findMany({ where: { user_id: id } });
    const orderIds = orders.map((o) => o.id);

    if (orderIds.length > 0) {
      console.info("[deleteUserService] Excluindo itens de pedidos relacionados", { orderIds });
      await tx.order_items.deleteMany({ where: { order_id: { in: orderIds } } });
    }

    console.info("[deleteUserService] Excluindo pagamentos e pedidos do usuário", { userId: id });
    await tx.payments.deleteMany({ where: { user_id: id } });
    await tx.orders.deleteMany({ where: { user_id: id } });

    console.info("[deleteUserService] Excluindo usuário", { userId: id });
    await tx.users.delete({ where: { id } });
  });

  console.info("[deleteUserService] Usuário excluído com sucesso", { userId: id });
  return { message: "Usuário e entidades relacionadas excluídos com sucesso" };
};

// 🔹 Gerar token de reset
export const generateResetToken = async (email: string) => {
  console.info("[generateResetToken] Gerando token de reset", { email });

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    console.warn("[generateResetToken] Usuário não encontrado", { email });
    throw new Error("Usuário não encontrado");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  await prisma.users.update({
    where: { email },
    data: { resetToken, resetTokenExpires: new Date(Date.now() + 3600000) },
  });

  await sendResetPasswordEmail(email, resetToken);
  console.info("[generateResetToken] Token de reset gerado e email enviado", { email });
  return { message: "Email de redefinição enviado" };
};

// 🔹 Redefinir senha
export const resetUserPassword = async (token: string, newPassword: string) => {
  console.info("[resetUserPassword] Tentando redefinir senha", { token });

  const user = await prisma.users.findFirst({
    where: { resetToken: token, resetTokenExpires: { gte: new Date() } },
  });

  if (!user) {
    console.warn("[resetUserPassword] Token inválido ou expirado", { token });
    throw new Error("Token inválido ou expirado");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({
    where: { id: user.id },
    data: { password_hash: hashedPassword, resetToken: null, resetTokenExpires: null },
  });

  console.info("[resetUserPassword] Senha redefinida com sucesso", { userId: user.id });
  return { message: "Senha redefinida com sucesso" };
};
