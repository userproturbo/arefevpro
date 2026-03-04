import SceneEngine from "@/engine/SceneEngine";
import homeScene from "@/scenes/homeScene";

export default function SceneTestPage() {
  return (
    <div
      className="bg-black"
      style={{ width: "100vw", height: "100vh" }}
    >
      <SceneEngine scene={homeScene} />
    </div>
  );
}
