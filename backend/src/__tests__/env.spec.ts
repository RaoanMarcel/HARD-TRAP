import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do dotenv-safe para não carregar .env real
vi.mock("dotenv-safe", () => ({
  default: { config: vi.fn() },
}));

// 🔹 Mock do path.resolve (não precisamos do caminho real)
vi.mock("path", () => ({
  default: { resolve: vi.fn(() => "/fake/path/.env.example") },
}));

describe("env.ts", () => {
  beforeEach(() => {
    vi.resetModules(); // limpa cache dos módulos
    process.env = {};  // reseta env
  });

  it("deve construir env corretamente quando todas variáveis estão definidas", async () => {
    process.env = {
      NODE_ENV: "test",
      PORT: "5000",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      JWT_SECRET: "jwtsecret",
      SMTP_HOST: "smtp.test",
      SMTP_PORT: "2525",
      SMTP_USER: "user",
      SMTP_PASS: "pass",
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_PUBLISHABLE_KEY: "pk_test",
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      DEFAULT_BOX_WEIGHT_G: "100",
      DEFAULT_BOX_LENGTH_CM: "10",
      DEFAULT_BOX_WIDTH_CM: "20",
      DEFAULT_BOX_HEIGHT_CM: "30",
      MERCHANT_CEP: "12345678",
      MELHOR_ENVIO_CLIENT_ID: "client_id",
      MELHOR_ENVIO_CLIENT_SECRET: "client_secret",
      MELHOR_ENVIO_SANDBOX: "true",
    };

    const { env } = await import("..//env");

    expect(env).toEqual({
      NODE_ENV: "test",
      PORT: 5000,
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      JWT_SECRET: "jwtsecret",
      SMTP: {
        HOST: "smtp.test",
        PORT: 2525,
        USER: "user",
        PASS: "pass",
      },
      STRIPE: {
        SECRET_KEY: "sk_test",
        PUBLISHABLE_KEY: "pk_test",
        WEBHOOK_SECRET: "whsec_test",
      },
      DEFAULTS: {
        BOX_WEIGHT_G: 100,
        BOX_LENGTH_CM: 10,
        BOX_WIDTH_CM: 20,
        BOX_HEIGHT_CM: 30,
        MERCHANT_CEP: "12345678",
      },
      MELHOR_ENVIO: {
        CLIENT_ID: "client_id",
        CLIENT_SECRET: "client_secret",
        SANDBOX: true,
      },
    });
  });

  it("deve lançar erro se variável obrigatória estiver ausente", async () => {
    process.env = {
      // faltando DATABASE_URL
      JWT_SECRET: "jwtsecret",
      SMTP_HOST: "smtp.test",
      SMTP_PORT: "2525",
      SMTP_USER: "user",
      SMTP_PASS: "pass",
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_PUBLISHABLE_KEY: "pk_test",
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      DEFAULT_BOX_WEIGHT_G: "100",
      DEFAULT_BOX_LENGTH_CM: "10",
      DEFAULT_BOX_WIDTH_CM: "20",
      DEFAULT_BOX_HEIGHT_CM: "30",
      MERCHANT_CEP: "12345678",
      MELHOR_ENVIO_CLIENT_ID: "client_id",
      MELHOR_ENVIO_CLIENT_SECRET: "client_secret",
      MELHOR_ENVIO_SANDBOX: "true",
    };

    await expect(import("..//env")).rejects.toThrow(
      "[ENV ERROR] Variável obrigatória não definida: DATABASE_URL"
    );
  });
});