import { PostType } from "@prisma/client";
import AdminPostTypeSection from "./AdminPostTypeSection";

export default async function AdminBlogSection() {
  return (
    <AdminPostTypeSection
      title="Blog"
      description="Published and draft blog articles."
      emptyText="No blog posts yet."
      postType={PostType.BLOG}
      createHref="/admin/blog/new"
      editHref={(id) => `/admin/blog/${id}/edit`}
    />
  );
}
