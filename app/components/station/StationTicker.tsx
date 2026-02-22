"use client";

type StationTickerProps = {
  text: string;
};

export default function StationTicker({ text }: StationTickerProps) {
  return (
    <aside
      aria-label="Station ticker"
      className="station-ticker flex min-w-0 items-center"
    >
      <div className="station-ticker-scroll-area" aria-hidden="true">
        <div className="station-ticker-layer station-ticker-layer-glow">
          <span className="station-ticker-segment">{text}</span>
          <span className="station-ticker-segment">{text}</span>
        </div>
        <div className="station-ticker-layer station-ticker-layer-main">
          <span className="station-ticker-segment">{text}</span>
          <span className="station-ticker-segment">{text}</span>
        </div>
      </div>
      <span className="station-ticker-sys">[ SYS ]</span>
    </aside>
  );
}
