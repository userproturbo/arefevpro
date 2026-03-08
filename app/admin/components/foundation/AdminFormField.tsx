import type { ReactNode } from "react";

type AdminFormFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export default function AdminFormField({ label, hint, error, children }: AdminFormFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-[0.12em] text-white/65">{label}</span>
      {children}
      {error ? <span className="text-xs text-[#ff8f8f]">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-white/45">{hint}</span> : null}
    </label>
  );
}
