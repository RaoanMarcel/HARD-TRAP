import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do nodemailer
vi.mock("nodemailer", () => {
  const sendMailMock = vi.fn();
  const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));

  return {
    default: { createTransport: createTransportMock },
    createTransport: createTransportMock,
    __m: { sendMailMock, createTransportMock },
  };
});

import * as nodemailerModule from "nodemailer";
const { sendMailMock, createTransportMock } = (nodemailerModule as any).__m;

describe("mailer util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FRONTEND_URL = "http://localhost:3000";
  });

  it("deve chamar sendMail com os parâmetros corretos", async () => {
    const { sendResetPasswordEmail } = await import("../../utils/mailer");

    await sendResetPasswordEmail("user@test.com", "abc123");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: "Redefinição de senha - HardTrap",
        html: expect.stringContaining(
          "http://localhost:3000/reset-password?token=abc123"
        ),
      })
    );
  });

  it("deve propagar erro se sendMail falhar", async () => {
    const { sendResetPasswordEmail } = await import("../../utils/mailer");

    sendMailMock.mockRejectedValueOnce(new Error("Falha SMTP"));

    await expect(
      sendResetPasswordEmail("user@test.com", "token123")
    ).rejects.toThrow("Falha SMTP");
  });

  it("transporter deve ser criado com as configs de ambiente", async () => {
    // define variáveis ANTES de importar o módulo
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";

    vi.resetModules(); // força reload do módulo
    await import("../../utils/mailer");

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.test.com",
        port: 587,
        secure: false,
        auth: { user: "user", pass: "pass" },
      })
    );
  });
});