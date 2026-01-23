import { LocalStorageAdapter } from "./localStorage";
import { StorageAdapter } from "./types";
import { YandexStorageAdapter } from "./yandexStorage";

export type StorageMode = "s3" | "local";

export function getStorageMode(): StorageMode {
  const override = process.env.USE_OBJECT_STORAGE;
  if (override !== undefined) {
    if (override === "true") return "s3";
    if (override === "false") return "local";
  }

  return process.env.NODE_ENV === "production" ? "s3" : "local";
}

export function getStorageAdapter(): StorageAdapter {
  const mode = getStorageMode();
  if (mode === "s3") {
    return new YandexStorageAdapter();
  }

  return new LocalStorageAdapter();
}
