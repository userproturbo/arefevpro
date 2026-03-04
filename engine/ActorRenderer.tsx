"use client";

import type { CSSProperties } from "react";
import type { Actor } from "./sceneTypes";

type ActorRendererProps = {
  actor: Actor;
};

function toInsetValue(value?: number | string) {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "number" ? `${value}px` : value;
}

export default function ActorRenderer({ actor }: ActorRendererProps) {
  const Component = actor.component;

  const style: CSSProperties = {
    position: "absolute",
    left: toInsetValue(actor.position?.x),
    top: toInsetValue(actor.position?.y),
    transform: actor.position?.z !== undefined ? `translateZ(${toInsetValue(actor.position.z)})` : undefined,
  };

  return (
    <div style={style} data-actor-id={actor.id}>
      <Component {...(actor.props ?? {})} />
    </div>
  );
}
