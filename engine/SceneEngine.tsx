"use client";

import type { Scene } from "./sceneTypes";
import ActorRenderer from "./ActorRenderer";

type SceneEngineProps = {
  scene: Scene;
};

export default function SceneEngine({ scene }: SceneEngineProps) {
  return (
    <div
      data-scene-id={scene.id}
      className={scene.className}
      style={{ position: "relative", width: "100%", height: "100%", ...scene.style }}
    >
      {scene.actors.map((actor) => (
        <ActorRenderer key={actor.id} actor={actor} />
      ))}
    </div>
  );
}
