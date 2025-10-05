import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do cloudinary com default e v2
vi.mock("cloudinary", () => {
  return {
    default: {
      v2: {
        config: vi.fn(),
        uploader: {
          upload: vi.fn(),
        },
      },
    },
    v2: {
      config: vi.fn(),
      uploader: {
        upload: vi.fn(),
      },
    },
  };
});

// importa depois dos mocks
import { uploadImageToCloudinary } from "../../utils/imageUpload";
import cloudinary from "cloudinary";

describe("uploadImageToCloudinary util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve resolver com a URL segura quando upload for bem-sucedido", async () => {
    (cloudinary.v2.uploader.upload as any).mockImplementation(
      (filePath: any, options: any, cb: any) => {
        cb(null, { secure_url: "http://fake.url/produto.png" });
      }
    );

    const result = await uploadImageToCloudinary("fake/path.png");

    expect(result).toBe("http://fake.url/produto.png");
    expect(cloudinary.v2.uploader.upload).toHaveBeenCalledWith(
      "fake/path.png",
      { folder: "products" },
      expect.any(Function)
    );
  });

  it("deve rejeitar se ocorrer erro no upload", async () => {
    (cloudinary.v2.uploader.upload as any).mockImplementation(
      (filePath: any, options: any, cb: any) => {
        cb(new Error("Falha no upload"), null);
      }
    );

    await expect(uploadImageToCloudinary("fake/path.png")).rejects.toThrow(
      "Falha no upload"
    );
  });

  it("deve rejeitar se não houver resultado", async () => {
    (cloudinary.v2.uploader.upload as any).mockImplementation(
      (filePath: any, options: any, cb: any) => {
        cb(null, null);
      }
    );

    await expect(uploadImageToCloudinary("fake/path.png")).rejects.toThrow();
  });
});