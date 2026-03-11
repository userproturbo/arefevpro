import type { CSSProperties, ReactNode } from "react";
import { adminTheme } from "@/app/admin/components/foundation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const adminVars = {
    "--admin-glow": adminTheme.glow,
    "--admin-border": adminTheme.border,
    "--admin-bg": adminTheme.background,
    "--admin-panel": adminTheme.panel,
    "--admin-panel-alt": adminTheme.panelAlt,
    "--admin-text": adminTheme.text,
    "--admin-text-muted": adminTheme.textMuted,
    "--admin-danger": adminTheme.danger,
  } as CSSProperties;

  return (
    <div
      style={adminVars}
      className="relative flex h-screen min-h-screen flex-col overflow-hidden bg-[color:var(--admin-bg)] text-[color:var(--admin-text)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-10%,rgba(0,255,156,0.14),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(0,255,156,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
