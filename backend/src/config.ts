import { env } from "./env";

export const config = {
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
  },
  db: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
  smtp: env.SMTP,
  stripe: env.STRIPE,
  defaults: env.DEFAULTS,
  melhorEnvio: env.MELHOR_ENVIO,
};
