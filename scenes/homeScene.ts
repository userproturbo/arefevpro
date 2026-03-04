import { createElement, type CSSProperties } from "react";
import type { Actor, Scene } from "@/engine/sceneTypes";

type PlaceholderActorProps = {
  label: string;
};

function PlaceholderActor({ label }: PlaceholderActorProps) {
  const style: CSSProperties = {
    padding: "0.75rem 1rem",
    border: "1px dashed rgba(255, 255, 255, 0.35)",
    borderRadius: "999px",
    background: "rgba(9, 9, 11, 0.6)",
    color: "#f4f4f5",
    fontSize: "0.875rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };

  return createElement("div", { style }, label);
}

const homeActors: Actor[] = [
  {
    id: "home-photo-character",
    component: PlaceholderActor,
    position: { x: "12%", y: "58%", z: 10 },
    props: { label: "Photo Character" },
  },
  {
    id: "home-drone-character",
    component: PlaceholderActor,
    position: { x: "34%", y: "34%", z: 20 },
    props: { label: "Drone Character" },
  },
  {
    id: "home-music-character",
    component: PlaceholderActor,
    position: { x: "58%", y: "62%", z: 30 },
    props: { label: "Music Character" },
  },
  {
    id: "home-blog-character",
    component: PlaceholderActor,
    position: { x: "78%", y: "42%", z: 15 },
    props: { label: "Blog Character" },
  },
];

export const homeScene: Scene = {
  id: "home-scene",
  actors: homeActors,
};

export default homeScene;
