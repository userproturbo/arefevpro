import "server-only";

type PrismaErrorLike = {
  name?: unknown;
  code?: unknown;
  message?: unknown;
};

type DbErrorDetails = {
  name?: string;
  code?: string;
  message?: string;
};

const DB_UNAVAILABLE_CODES = new Set([
  "P1000", // Authentication failed
  "P1001", // Can't reach database server
  "P1002", // Connection timed out
  "P1003", // Database does not exist
  "P1017", // Server has closed the connection
]);

function describeDbError(error: unknown): DbErrorDetails {
  if (!error || typeof error !== "object") return { message: String(error) };
  const prismaError = error as PrismaErrorLike;
  return {
    name: typeof prismaError.name === "string" ? prismaError.name : undefined,
    code: typeof prismaError.code === "string" ? prismaError.code : undefined,
    message: typeof prismaError.message === "string" ? prismaError.message : undefined,
  };
}

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const prismaError = error as PrismaErrorLike;
  const name = typeof prismaError.name === "string" ? prismaError.name : "";
  const code = typeof prismaError.code === "string" ? prismaError.code : "";

  return name === "PrismaClientInitializationError" || DB_UNAVAILABLE_CODES.has(code);
}

export function getDatabaseUnavailableMessage(): string {
  return "Database is starting, please retry";
}

export function isExpectedDevDatabaseError(error: unknown): boolean {
  return process.env.NODE_ENV !== "production" && isDatabaseUnavailableError(error);
}

export function warnDatabaseUnavailableOnce(context: string, error: unknown): void {
  if (!isExpectedDevDatabaseError(error)) return;

  const details = describeDbError(error);
  const key = `${context}:${details.code ?? details.name ?? "unknown"}`;

  const globalForDb = globalThis as unknown as {
    __dbUnavailableLogged?: Set<string>;
  };

  if (!globalForDb.__dbUnavailableLogged) {
    globalForDb.__dbUnavailableLogged = new Set<string>();
  }

  if (globalForDb.__dbUnavailableLogged.has(key)) return;
  globalForDb.__dbUnavailableLogged.add(key);

  console.warn(`${context} database unavailable`);
}

export function logServerError(message: string, error: unknown): void {
  if (isExpectedDevDatabaseError(error)) return;
  console.error(message, error);
}
