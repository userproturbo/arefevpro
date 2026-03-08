import type { CharacterConsoleSection } from "@/store/characterConsoleStore";

export type CharacterSceneAnimationType = "music" | "blog" | "photo" | "drone";

type CharacterSceneMicroAnimation = {
  rotate?: number[];
  scale?: number[];
  y?: number[];
};

export type CharacterSceneConfig = {
  idleImage: string;
  actionImage: string;
  sound: string;
  soundVolume: number;
  animationType: CharacterSceneAnimationType;
  baseScale: number;
  hoverScale: number;
  microAnimation: CharacterSceneMicroAnimation;
};

type CharacterSceneMap = Record<CharacterConsoleSection | "drone", CharacterSceneConfig>;

const droneScene: CharacterSceneConfig = {
  idleImage: "/img/Drone-idle.png",
  actionImage: "/img/Drone-action.png",
  sound: "/audio/Drone.mp3",
  soundVolume: 0.25,
  animationType: "drone",
  baseScale: 1,
  hoverScale: 1.25,
  microAnimation: { y: [0, -8, 0] },
};

export const characterScenes: CharacterSceneMap = {
  music: {
    idleImage: "/img/Music-idle.png",
    actionImage: "/img/Music-action.png",
    sound: "/audio/Music.mp3",
    soundVolume: 0.25,
    animationType: "music",
    baseScale: 1,
    hoverScale: 1.25,
    microAnimation: { rotate: [-2, 2, -2] },
  },
  photo: {
    idleImage: "/img/Photo-idle.png",
    actionImage: "/img/Photo-action.png",
    sound: "/audio/camera.mp3",
    soundVolume: 0.35,
    animationType: "photo",
    baseScale: 1,
    hoverScale: 1.25,
    microAnimation: { scale: [1, 1.03] },
  },
  blog: {
    idleImage: "/img/Blog-idle.png",
    actionImage: "/img/Blog-action.png",
    sound: "/audio/drawing.mp3",
    soundVolume: 0.3,
    animationType: "blog",
    baseScale: 1,
    hoverScale: 1.25,
    microAnimation: { rotate: [-1, 1] },
  },
  video: droneScene,
  drone: droneScene,
};
