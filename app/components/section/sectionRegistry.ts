import type { ComponentType } from "react";
import type { SectionViewer } from "@/app/components/interface/viewerTypes";
import type { AppIcon } from "@/app/components/icons";
import { AudioIcon, BlogIcon, HomeIcon, PhotoIcon, RocketIcon, VideoIcon } from "@/app/components/icons";
import type { LayeredNavCharacterBaseProps } from "@/app/components/home/LayeredNavCharacter";
import BlogNavCharacter from "@/app/components/home/BlogNavCharacter";
import DroneNavCharacter from "@/app/components/home/DroneNavCharacter";
import HomeNavCharacter from "@/app/components/home/HomeNavCharacter";
import MusicNavCharacter from "@/app/components/home/MusicNavCharacter";
import PhotoNavCharacter from "@/app/components/home/PhotoNavCharacter";
import BlogPreview from "@/app/components/home/previews/BlogPreview";
import DefaultPreview from "@/app/components/home/previews/DefaultPreview";
import DronePreview from "@/app/components/home/previews/DronePreview";
import MusicPreview from "@/app/components/home/previews/MusicPreview";
import PhotoPreview from "@/app/components/home/previews/PhotoPreview";
import BlogSection from "./BlogSection";
import HomeSection from "./HomeSection";
import MusicSection from "./MusicSection";
import PhotoSection from "./PhotoSection";
import ProjectsSection from "./ProjectsSection";
import VideoSceneSection from "./VideoSceneSection";

type SectionComponentProps = {
  viewer: SectionViewer;
  setViewer: (viewer: SectionViewer) => void;
};

type SectionRegistryEntry = {
  label: string;
  title: string;
  icon: AppIcon;
  component: ComponentType<SectionComponentProps>;
  character: ComponentType<LayeredNavCharacterBaseProps>;
  preview: ComponentType;
  soundSrc: string;
};

export const sectionRegistry = {
  home: {
    label: "Home",
    title: "Home Base",
    icon: HomeIcon,
    component: HomeSection,
    character: HomeNavCharacter,
    preview: DefaultPreview,
    soundSrc: "/audio/Drone.mp3",
  },
  photo: {
    label: "Photo",
    title: "Photo Archive",
    icon: PhotoIcon,
    component: PhotoSection,
    character: PhotoNavCharacter,
    preview: PhotoPreview,
    soundSrc: "/audio/camera.mp3",
  },
  music: {
    label: "Music",
    title: "Music Deck",
    icon: AudioIcon,
    component: MusicSection,
    character: MusicNavCharacter,
    preview: MusicPreview,
    soundSrc: "/audio/Music.mp3",
  },
  video: {
    label: "Video",
    title: "Video Feed",
    icon: VideoIcon,
    component: VideoSceneSection,
    character: DroneNavCharacter,
    preview: DronePreview,
    soundSrc: "/audio/Drone.mp3",
  },
  blog: {
    label: "Blog",
    title: "Blog Stream",
    icon: BlogIcon,
    component: BlogSection,
    character: BlogNavCharacter,
    preview: BlogPreview,
    soundSrc: "/audio/drawing.mp3",
  },
  projects: {
    label: "Projects",
    title: "Projects Grid",
    icon: RocketIcon,
    component: ProjectsSection,
    character: DroneNavCharacter,
    preview: DronePreview,
    soundSrc: "/audio/Drone.mp3",
  },
} as const satisfies Record<string, SectionRegistryEntry>;

export type SectionRegistry = typeof sectionRegistry;
export type SectionRegistryKey = keyof SectionRegistry;

export const sectionEntries = Object.entries(sectionRegistry) as Array<
  [SectionRegistryKey, SectionRegistry[SectionRegistryKey]]
>;
