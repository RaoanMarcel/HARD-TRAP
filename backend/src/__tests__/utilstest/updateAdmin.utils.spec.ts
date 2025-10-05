import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do prisma (mocks criados dentro do vi.mock)
vi.mock("../../prisma", () => {
  const updateMock = vi.fn();
  const disconnectMock = vi.fn();

  return {
    prisma: {
      users: { update: updateMock },
      $disconnect: disconnectMock,
    },
    __m: { updateMock, disconnectMock }, // expõe para os testes
  };
});

// importa depois dos mocks
import { main } from "../../utils/updateAdmin";
import * as prismaModule from "../../prisma";

// pega os mocks expostos
const { updateMock, disconnectMock } = (prismaModule as any).__m;

describe("updateAdmin script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve atualizar o usuário para ADMIN e logar o resultado", async () => {
    const fakeUser = { id: 1, email: "raoanmarcel@gmail.com", role: "ADMIN" };
    updateMock.mockResolvedValue(fakeUser);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await main();

    expect(updateMock).toHaveBeenCalledWith({
      where: { email: "raoanmarcel@gmail.com" },
      data: { role: "ADMIN" },
    });
    expect(logSpy).toHaveBeenCalledWith(
      "Usuário atualizado para admin:",
      fakeUser
    );
    expect(disconnectMock).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it("deve logar erro se update falhar", async () => {
    const error = new Error("Falha no update");
    updateMock.mockRejectedValue(error);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await main().catch(() => {});

    expect(errorSpy).toHaveBeenCalledWith(error);
    expect(disconnectMock).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});