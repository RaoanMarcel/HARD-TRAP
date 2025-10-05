import { describe, it, expect, vi, beforeEach } from "vitest";
import Joi from "joi";
import { validateRequest } from "../../utils/validation.util"; // ajuste o caminho conforme sua estrutura

describe("validateRequest util", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("deve validar body com sucesso e retornar o valor", () => {
    const schema = Joi.object({ name: Joi.string().required() });
    mockReq.body = { name: "Raoan", extra: "ignore" };

    const result = validateRequest(schema, mockReq, mockRes);

    expect(result).toEqual({ name: "Raoan" }); // stripUnknown remove "extra"
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("deve retornar erro 400 se body for inválido", () => {
    const schema = Joi.object({ name: Joi.string().required() });
    mockReq.body = {};

    const result = validateRequest(schema, mockReq, mockRes);

    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "name" }),
        ]),
      })
    );
  });

  it("deve validar params quando target = 'params'", () => {
    const schema = Joi.object({ id: Joi.number().required() });
    mockReq.params = { id: 123 };

    const result = validateRequest(schema, mockReq, mockRes, "params");

    expect(result).toEqual({ id: 123 });
  });

  it("deve validar query quando target = 'query'", () => {
    const schema = Joi.object({ page: Joi.number().required() });
    mockReq.query = { page: 2 };

    const result = validateRequest(schema, mockReq, mockRes, "query");

    expect(result).toEqual({ page: 2 });
  });
});