import AdminStatusBadge from "./foundation/AdminStatusBadge";

type StatusBadgeProps = {
  published: boolean;
};

export default function StatusBadge({ published }: StatusBadgeProps) {
  return <AdminStatusBadge status={published ? "published" : "draft"} />;
}
