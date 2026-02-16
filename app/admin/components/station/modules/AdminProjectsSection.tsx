import { PostType } from "@prisma/client";
import AdminPostTypeSection from "./AdminPostTypeSection";

type Props = {
  createMode: boolean;
  editId: number | null;
};

export default async function AdminProjectsSection({ createMode, editId }: Props) {
  return (
    <AdminPostTypeSection
      title="Projects"
      description="Project and about entries."
      emptyText="No project entries yet."
      postType={PostType.ABOUT}
      sectionPath="/admin/projects"
      createMode={createMode}
      editId={editId}
    />
  );
}
