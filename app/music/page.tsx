import PageContainer from "../components/PageContainer";

export default function MusicPage() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="h-48 rounded-xl border border-white/10 bg-white/[0.04]" />
        <div className="h-48 rounded-xl border border-white/10 bg-white/[0.04]" />
      </div>
    </PageContainer>
  );
}
