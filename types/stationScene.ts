export type StationSceneId = "blog" | "photo" | "video" | "audio" | "home";

export type StationSceneConfig = {
  id: StationSceneId;
  label: string;
  modules: string[];
  layout?: "default" | "editorial" | "media";
};
