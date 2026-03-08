import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#ff9b6e]/75">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
