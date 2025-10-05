import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { upload } from "../../middlewares/upload.middleware"; // reuso do multer configurado
import { validateImage } from "../../middlewares/validateImage";

// cria um app só para os testes de validação de imagem
const app = express();
app.post("/upload-image", upload.single("file"), validateImage, (req, res) => {
  res.status(200).json({ success: true, message: "Imagem válida!" });
});

describe("validateImage Middleware", () => {
  it("deve retornar 400 se nenhuma imagem for enviada", async () => {
    const res = await request(app).post("/upload-image");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Nenhuma imagem enviada.");
  });

  it("deve retornar 400 se o tipo de arquivo for inválido", async () => {
    const res = await request(app)
      .post("/upload-image")
      .attach("file", Buffer.from("conteúdo de teste"), "teste.txt"); // mimetype text/plain
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Imagem inválida/);
  });

  it("deve retornar 400 se o arquivo exceder 5MB", async () => {
    // cria um buffer maior que 5MB
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024, "a");
    const res = await request(app)
      .post("/upload-image")
      .attach("file", bigBuffer, { filename: "big.png", contentType: "image/png" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Imagem inválida/);
  });

  it("deve aceitar imagem válida (PNG < 5MB)", async () => {
    const res = await request(app)
      .post("/upload-image")
      .attach("file", Buffer.from("fake image content"), { filename: "ok.png", contentType: "image/png" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Imagem válida!");
  });
});