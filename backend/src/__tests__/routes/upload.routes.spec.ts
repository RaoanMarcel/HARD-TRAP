import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mocks primeiro
vi.mock("../../middlewares/validateImage", () => ({
  validateImage: (req: any, res: any, next: any) => next(),
}));

vi.mock("../../controllers/upload.controller", () => {
  return {
    uploadImage: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Imagem recebida", file: req.file })
    ),
  };
});

// importa os mocks para usar nos expects
import { uploadImage } from "../../controllers/upload.controller";

// só agora importa o router
import uploadRoutes from "../../routes/upload.routes";

const app = express();
app.use(express.json());
app.use("/files", uploadRoutes);

describe("Upload Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /files/upload deve chamar uploadImage", async () => {
    const res = await request(app)
      .post("/files/upload")
      .attach("image", Buffer.from("fake"), "fake.png");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Imagem recebida");
    expect(uploadImage).toHaveBeenCalled();
  });
});