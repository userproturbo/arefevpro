import type { ComponentType, CSSProperties } from "react";

export type ActorPosition = {
  x?: number | string;
  y?: number | string;
  z?: number | string;
};

export type ActorProps = Record<string, unknown>;

export type Actor = {
  id: string;
  component: ComponentType<any>;
  position?: ActorPosition;
  props?: ActorProps;
};

export type Scene = {
  id: string;
  actors: Actor[];
  className?: string;
  style?: CSSProperties;
};
