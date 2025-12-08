import PageContainer from "../components/PageContainer";
import ProjectsGrid from "../components/ProjectsGrid";

export default function ProjectsPage() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Projects</h1>
        <p className="text-white/70 leading-relaxed">
          Curated works and experiments will live here soon. For now — a clean grid of placeholders
          to feel the layout and motion.
        </p>
      </div>

      <div className="mt-10">
        <ProjectsGrid />
      </div>
    </PageContainer>
  );
}
