import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do módulo env
vi.mock("../env", () => {
  const envMock = {
    NODE_ENV: "test",
    PORT: 4000,
    DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    JWT_SECRET: "supersecret",
    SMTP: { host: "smtp.test", port: 587 },
    STRIPE: { key: "stripe_key" },
    DEFAULTS: { currency: "BRL" },
    MELHOR_ENVIO: { token: "melhor_envio_token" },
  };
  return { env: envMock, __m: envMock };
});

import { config } from "../config";
import * as envModule from "..//env";

const envMock = (envModule as any).__m;

describe("config.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mapear corretamente os valores do env", () => {
    expect(config).toEqual({
      app: { env: "test", port: 4000 },
      db: { url: "postgres://user:pass@localhost:5432/db" },
      jwt: { secret: "supersecret" },
      smtp: { host: "smtp.test", port: 587 },
      stripe: { key: "stripe_key" },
      defaults: { currency: "BRL" },
      melhorEnvio: { token: "melhor_envio_token" },
    });
  });

  it("deve refletir mudanças no env mock", async () => {
    envMock.PORT = 9999;
    envMock.JWT_SECRET = "changed";

    // 🔹 limpa o cache dos módulos
    vi.resetModules();

    // 🔹 reimporta o config após reset
    const { config: freshConfig } = await import("../config");

    expect(freshConfig.app.port).toBe(9999);
    expect(freshConfig.jwt.secret).toBe("changed");
  });
});