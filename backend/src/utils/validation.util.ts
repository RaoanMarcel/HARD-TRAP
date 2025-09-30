import { ObjectSchema } from "joi";
import { Request, Response } from "express";

type ValidationTarget = "body" | "params" | "query";

export const validateRequest = (
  schema: ObjectSchema,
  req: Request,
  res: Response,
  target: ValidationTarget = "body" // 🔹 por padrão valida o body
) => {
  const dataToValidate =
    target === "params" ? req.params :
    target === "query" ? req.query :
    req.body;

  const { error, value } = schema.validate(dataToValidate, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    res.status(400).json({
      success: false,
      errors: error.details.map((e) => ({
        field: e.path[0] as string,
        message: e.message,
      })),
    });
    return null;
  }

  return value;
};
