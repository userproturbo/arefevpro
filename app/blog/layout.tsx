import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
