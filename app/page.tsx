import PageContainer from "./components/PageContainer";

export default function HomePage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Home</h1>
        <p className="text-white/70 leading-relaxed">
          CRAZYLIFE — спокойное место, где соберутся проекты, фотографии, видео, музыка и истории.
          Сейчас сайт в стадии наполнения, но навигация уже готова.
        </p>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/70">
          Выберите раздел в верхнем меню, чтобы посмотреть заготовленные страницы. Контент появится
          совсем скоро.
        </div>
      </div>
    </PageContainer>
  );
}
