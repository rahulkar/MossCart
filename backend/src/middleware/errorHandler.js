import { config } from "../config.js";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err, _req, res, _next) {
  const isDev = config.NODE_ENV === "development";

  if (err instanceof AppError) {
    if (isDev) console.error(err);
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(isDev && { stack: err.stack }),
      },
    });
  }

  // Zod validation errors are handled by validate middleware; this catches any unexpected ones.
  if (err?.name === "ZodError") {
    const message = err.issues?.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") || "Validation failed";
    return res.status(400).json({
      error: { message, code: "validation_error" },
    });
  }

  console.error("Unexpected error:", err);
  res.status(500).json({
    error: {
      message: isDev ? err.message : "Internal server error",
      code: "internal_error",
      ...(isDev && { stack: err.stack }),
    },
  });
}
