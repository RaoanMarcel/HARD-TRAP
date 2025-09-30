import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../logger";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUserService = async (data: RegisterInput) => {
  const { name, email, password } = data;

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn("Tentativa de registro com e-mail já existente", { email });
      throw new Error("E-mail já está em uso");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: "CUSTOMER",
      },
    });

    logger.info("Usuário registrado com sucesso", { userId: user.id, email });
    return { id: user.id, name: user.name, email: user.email };
  } catch (err: any) {
    logger.error("Erro ao registrar usuário", { error: err.message, email });
    throw err;
  }
};

export const loginUserService = async (data: LoginInput) => {
  const { email, password } = data;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      logger.warn("Tentativa de login com e-mail inválido", { email });
      throw new Error("Credenciais inválidas");
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      logger.warn("Tentativa de login com senha incorreta", { email });
      throw new Error("Credenciais inválidas");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role ?? "CUSTOMER" },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" }
    );

    logger.info("Login realizado com sucesso", { userId: user.id, email });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  } catch (err: any) {
    logger.error("Erro ao realizar login", { error: err.message, email });
    throw err;
  }
};
