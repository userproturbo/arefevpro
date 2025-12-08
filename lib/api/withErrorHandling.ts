import { ZodError } from "zod";
import { ApiError } from "./validate";

type Handler<TParams> = (req: Request, context: { params: TParams }) => Promise<Response>;

export function withErrorHandling<TParams>(handler: Handler<TParams>) {
  return async (req: Request, context: { params: TParams }) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json({ success: false, error: error.message }, { status: error.status });
      }

      if (error instanceof ZodError) {
        return Response.json(
          { success: false, error: "Неверные данные", details: error.errors },
          { status: 400 }
        );
      }

      console.error("API handler error:", error);
      return Response.json(
        { success: false, error: "Внутренняя ошибка сервера" },
        { status: 500 }
      );
    }
  };
}
