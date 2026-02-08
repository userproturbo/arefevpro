export default function SoftBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="animate-pulse-slow absolute -top-16 -left-10 h-80 w-80 rounded-full bg-indigo-400/25 blur-[120px] sm:h-96 sm:w-96" />
      <div className="animate-pulse-slow absolute bottom-6 left-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-[110px] sm:h-96 sm:w-96" />
      <div className="animate-pulse-slow absolute -bottom-24 right-0 h-[26rem] w-[26rem] rounded-full bg-emerald-400/16 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.04),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(255,200,255,0.06),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(120,220,255,0.08),transparent_45%)]" />
    </div>
  );
}
