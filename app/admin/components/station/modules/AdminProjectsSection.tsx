import { PostType } from "@prisma/client";
import AdminPostTypeSection from "./AdminPostTypeSection";

export default async function AdminProjectsSection() {
  return (
    <AdminPostTypeSection
      title="Projects"
      description="Project and about entries."
      emptyText="No project entries yet."
      postType={PostType.ABOUT}
      createHref="/admin/posts/new?type=about"
      editHref={(id) => `/admin/posts/${id}/edit`}
    />
  );
}
