import { z } from "zod";
import { getCurrentUser } from "../auth";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const commentBodySchema = z.object({
  text: z.string().trim().min(1, "Текст обязателен").max(2000, "Максимум 2000 символов"),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export function parseCommentBody(body: unknown) {
  return commentBodySchema.parse(body);
}

export function parseIdParams(params: unknown) {
  return idParamSchema.parse(params);
}

export function parseSlugParams(params: unknown) {
  return slugParamSchema.parse(params);
}

export async function requireAuthUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("Требуется авторизация", 401);
  }

  return user;
}
