import { PostType } from "@prisma/client";
import AdminPostTypeSection from "./AdminPostTypeSection";

type Props = {
  createMode: boolean;
  editId: number | null;
};

export default async function AdminAudioSection({ createMode, editId }: Props) {
  return (
    <AdminPostTypeSection
      title="Audio"
      description="Music and audio section posts."
      emptyText="No audio entries yet."
      postType={PostType.MUSIC}
      sectionPath="/admin/audio"
      createMode={createMode}
      editId={editId}
    />
  );
}
