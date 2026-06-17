import { ZodError } from "zod";

export function validate(schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues.map((i) => `${i.path.slice(1).join(".")}: ${i.message}`).join("; ");
        const error = new Error(message);
        error.name = "ZodError";
        error.statusCode = 400;
        return next(error);
      }
      next(err);
    }
  };
}
