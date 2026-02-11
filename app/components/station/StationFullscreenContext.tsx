import { createContext, useContext } from "react";

type StationFullscreenContextValue = {
  isFullscreen: boolean;
  setFullscreen: (value: boolean) => void;
};

const StationFullscreenContext = createContext<StationFullscreenContextValue | null>(null);

export const StationFullscreenProvider = StationFullscreenContext.Provider;

export function useStationFullscreen() {
  const context = useContext(StationFullscreenContext);
  if (!context) {
    throw new Error("useStationFullscreen must be used within StationFullscreenProvider");
  }
  return context;
}
