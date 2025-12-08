import PageContainer from "../components/PageContainer";

export default function PhotoPage() {
  return (
    <PageContainer>
      <h1 className="mb-6 text-4xl font-bold">Photo</h1>
      <p className="mb-8 text-white/70 leading-relaxed">
        Фотографии скоро будут здесь. Пока можно представить, как кадры складываются в легкую,
        воздушную подборку.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="h-48 rounded-xl border border-white/10 bg-white/[0.04]" />
        <div className="h-48 rounded-xl border border-white/10 bg-white/[0.04]" />
      </div>
    </PageContainer>
  );
}
