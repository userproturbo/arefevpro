import BlogSection from "@/app/components/section/BlogSection";
import MusicSection from "@/app/components/section/MusicSection";
import PhotoSection from "@/app/components/section/PhotoSection";
import ProjectsSection from "@/app/components/section/ProjectsSection";
import VideoSceneSection from "@/app/components/section/VideoSceneSection";
import { characterScenes } from "@/config/characterScenes";
import type { SceneDefinition, SiteSection } from "./types";

export const scenes: Record<SiteSection, SceneDefinition> = {
  photo: {
    character: characterScenes.photo.idleImage,
    characterHover: characterScenes.photo.actionImage,
    sound: characterScenes.photo.sound,
    component: PhotoSection,
  },
  music: {
    character: characterScenes.music.idleImage,
    characterHover: characterScenes.music.actionImage,
    sound: characterScenes.music.sound,
    component: MusicSection,
  },
  video: {
    character: characterScenes.video.idleImage,
    characterHover: characterScenes.video.actionImage,
    sound: characterScenes.video.sound,
    component: VideoSceneSection,
  },
  blog: {
    character: characterScenes.blog.idleImage,
    characterHover: characterScenes.blog.actionImage,
    sound: characterScenes.blog.sound,
    component: BlogSection,
  },
  projects: {
    character: characterScenes.projects.idleImage,
    characterHover: characterScenes.projects.actionImage,
    sound: characterScenes.projects.sound,
    component: ProjectsSection,
  },
};
