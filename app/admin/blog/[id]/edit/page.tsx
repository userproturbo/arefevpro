import BlogEditor from "../../BlogEditor";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogEditor mode="edit" postId={id} />;
}
