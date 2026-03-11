"use client";

type VideoProgressBarProps = {
  progress: number;
};

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export default function VideoProgressBar({
  progress,
}: VideoProgressBarProps) {
  const safeProgress = clamp(progress);

  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
      <div
        className="h-full bg-[#e5484d] transition-[width] duration-300"
        style={{ width: `${safeProgress * 100}%` }}
      />
    </div>
  );
}
