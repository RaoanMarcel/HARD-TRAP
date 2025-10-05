import dotenvSafe from "dotenv-safe";
import path from "path";

dotenvSafe.config({
  allowEmptyValues: false,
  example: path.resolve(__dirname, "../.env.example"),
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[ENV ERROR] Variável obrigatória não definida: ${name}`);
  }
  return value;
}

// 🔹 Exporta todas as variáveis já validadas
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,

  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),

  SMTP: {
    HOST: requireEnv("SMTP_HOST"),
    PORT: parseInt(requireEnv("SMTP_PORT"), 10),
    USER: requireEnv("SMTP_USER"),
    PASS: requireEnv("SMTP_PASS"),
  },

  STRIPE: {
    SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
    PUBLISHABLE_KEY: requireEnv("STRIPE_PUBLISHABLE_KEY"),
    WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET"),
  },

  DEFAULTS: {
    BOX_WEIGHT_G: parseInt(requireEnv("DEFAULT_BOX_WEIGHT_G"), 10),
    BOX_LENGTH_CM: parseInt(requireEnv("DEFAULT_BOX_LENGTH_CM"), 10),
    BOX_WIDTH_CM: parseInt(requireEnv("DEFAULT_BOX_WIDTH_CM"), 10),
    BOX_HEIGHT_CM: parseInt(requireEnv("DEFAULT_BOX_HEIGHT_CM"), 10),
    MERCHANT_CEP: requireEnv("MERCHANT_CEP"),
  },

  MELHOR_ENVIO: {
    CLIENT_ID: requireEnv("MELHOR_ENVIO_CLIENT_ID"),
    CLIENT_SECRET: requireEnv("MELHOR_ENVIO_CLIENT_SECRET"),
    SANDBOX: requireEnv("MELHOR_ENVIO_SANDBOX") === "true",
  },
};
