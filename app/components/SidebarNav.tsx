import Link from "next/link";

const links = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/photo", label: "PHOTO" },
  { href: "/video", label: "VIDEO" },
  { href: "/music", label: "MUSIC" },
  { href: "/blog", label: "BLOG" },
];

export default function SidebarNav() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-48 flex-col px-6 py-12">
      <nav aria-label="Primary">
        <ul className="space-y-4">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm uppercase tracking-wide text-neutral-300 transition-colors hover:text-white"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
