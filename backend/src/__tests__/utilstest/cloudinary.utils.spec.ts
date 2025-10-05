import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do cloudinary e streamifier
const uploadStreamMock = vi.fn();
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: (...args: any[]) => uploadStreamMock(...args),
    },
  },
}));

const pipeMock = vi.fn();
vi.mock("streamifier", () => ({
  default: {
    createReadStream: vi.fn(() => ({ pipe: pipeMock })),
  },
  createReadStream: vi.fn(() => ({ pipe: pipeMock })),
}));

// importa depois dos mocks
import { uploadToCloudinary } from "../../utils/cloudinary";

describe("uploadToCloudinary util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve resolver com a URL segura quando upload for bem-sucedido", async () => {
    // simula callback de sucesso
    uploadStreamMock.mockImplementation((options, cb) => {
      // retorna uma stream fake
      setImmediate(() => cb(null, { secure_url: "http://fake.url/image.png" }));
      return { on: vi.fn(), end: vi.fn() };
    });

    const result = await uploadToCloudinary(Buffer.from("fake"));

    expect(result).toBe("http://fake.url/image.png");
    expect(uploadStreamMock).toHaveBeenCalledWith(
      { folder: "uploads", resource_type: "image" },
      expect.any(Function)
    );
    expect(pipeMock).toHaveBeenCalled();
  });

  it("deve rejeitar se ocorrer erro no upload", async () => {
    uploadStreamMock.mockImplementation((options, cb) => {
      setImmediate(() => cb(new Error("Falha no upload"), null));
      return { on: vi.fn(), end: vi.fn() };
    });

    await expect(uploadToCloudinary(Buffer.from("fake"))).rejects.toThrow("Falha no upload");
  });

  it("deve rejeitar se não houver secure_url no resultado", async () => {
    uploadStreamMock.mockImplementation((options, cb) => {
      setImmediate(() => cb(null, {}));
      return { on: vi.fn(), end: vi.fn() };
    });

    await expect(uploadToCloudinary(Buffer.from("fake"))).rejects.toThrow(
      "Erro ao obter URL da imagem"
    );
  });
});