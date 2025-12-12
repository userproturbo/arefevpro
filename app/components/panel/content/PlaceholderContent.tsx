"use client";

type PlaceholderContentProps = {
  label: string;
  description?: string;
};

export default function PlaceholderContent({ label, description }: PlaceholderContentProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-8 py-10 text-white/80">
      <p className="text-xs uppercase tracking-wide text-white/50">Preview</p>
      <h3 className="text-2xl font-semibold text-white">{label}</h3>
      {description ? <p className="max-w-2xl text-sm text-white/60">{description}</p> : null}
    </div>
  );
}
