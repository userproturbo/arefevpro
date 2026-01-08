import { LocalStorageAdapter } from "./localStorage";
import { StorageAdapter } from "./types";
import { YandexStorageAdapter } from "./yandexStorage";

export function getStorageAdapter(): StorageAdapter {
  if (process.env.USE_OBJECT_STORAGE === "true") {
    return new YandexStorageAdapter();
  }

  return new LocalStorageAdapter();
}
