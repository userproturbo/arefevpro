import { PostType } from "@prisma/client";
import AdminPostTypeSection from "./AdminPostTypeSection";

export default async function AdminAudioSection() {
  return (
    <AdminPostTypeSection
      title="Audio"
      description="Music and audio section posts."
      emptyText="No audio entries yet."
      postType={PostType.MUSIC}
      createHref="/admin/posts/new?type=music"
      editHref={(id) => `/admin/posts/${id}/edit`}
    />
  );
}
