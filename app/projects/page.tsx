import PageContainer from "../components/PageContainer";

export default function ProjectsPage() {
  return (
    <PageContainer>
      <h1 className="mb-6 text-4xl font-bold">Projects</h1>
      <p className="mb-8 text-white/70 leading-relaxed">
        Здесь появятся избранные проекты. Пока что раздел наполнен заглушками, но сетка уже готова
        для будущих работ.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="h-48 rounded-xl border border-white/10 bg-white/[0.04]" />
        <div className="h-48 rounded-xl border border-white/10 bg-white/[0.04]" />
      </div>
    </PageContainer>
  );
}
