"use client";

import { useEffect } from "react";
import type { Scene } from "./sceneTypes";
import ActorRenderer from "./ActorRenderer";
import { AudioManager } from "./AudioManager";

type SceneEngineProps = {
  scene: Scene;
};

export default function SceneEngine({ scene }: SceneEngineProps) {
  useEffect(() => {
    return () => {
      AudioManager.stop();
    };
  }, [scene.id]);

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
