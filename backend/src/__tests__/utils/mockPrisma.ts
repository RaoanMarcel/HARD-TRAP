import { vi } from "vitest";

// Criamos um objeto de mocks para cada método do Prisma que será usado
export const prisma = {
  product: {
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  // Caso futuramente outros modelos precisem de mocks
  // Exemplo:
  // user: { findUnique: vi.fn(), create: vi.fn() },
};

// Função auxiliar para limpar todos os mocks antes de cada teste
export const clearPrismaMocks = () => {
  Object.values(prisma).forEach((model) => {
    Object.values(model).forEach((fn: any) => fn.mockReset());
  });
};
