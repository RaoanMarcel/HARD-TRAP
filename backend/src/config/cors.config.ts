import { CorsOptions } from "cors";

const devOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

const prodOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Sem origem (ex: Postman, cURL) → libera
    if (!origin) return callback(null, true);

    const allowedOrigins =
      process.env.NODE_ENV === "production" ? prodOrigins : devOrigins;

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Origem bloqueada: ${origin}`);
    return callback(new Error("Não autorizado pela política de CORS"));
  },
  credentials: true, // permite cookies/headers de autenticação
};
