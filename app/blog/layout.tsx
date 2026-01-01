import { ReactNode } from "react";
import BlogShell from "./BlogShell";

export default async function BlogLayout({ children }: { children: ReactNode }) {
  return <BlogShell>{children}</BlogShell>;
}
