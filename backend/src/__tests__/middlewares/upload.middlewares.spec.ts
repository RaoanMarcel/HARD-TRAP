import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import express from "express";
import { upload } from "../../middlewares/upload.middleware";

const uploadDir = path.join(process.cwd(), "uploads");

// cria um app só para os testes de upload
const app = express();
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo enviado");
  }
  res.status(200).json({
    filename: req.file.filename,
    path: req.file.path,
  });
});

beforeAll(() => {
  // garante que a pasta exista antes dos testes
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
});

describe("Upload Middleware", () => {
  it("deve aceitar upload de arquivo e salvar na pasta correta", async () => {
    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("conteúdo de teste"), "teste.txt");

    expect(res.status).toBe(200);
    expect(res.body.filename).toMatch(/teste\.txt$/);

    const savedFile = path.join(uploadDir, res.body.filename);
    expect(fs.existsSync(savedFile)).toBe(true);
  });

  it("deve retornar erro se nenhum arquivo for enviado", async () => {
    const res = await request(app).post("/upload");
    expect(res.status).toBe(400);
    expect(res.text).toBe("Nenhum arquivo enviado");
  });

  afterAll(() => {
    // limpa os arquivos de teste
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        if (file.includes("teste.txt")) {
          fs.unlinkSync(path.join(uploadDir, file));
        }
      });
    }
  });
});