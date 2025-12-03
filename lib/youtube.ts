export function transformYoutubeUrlToEmbed(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, "");
    const isYoutubeHost =
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtu.be" ||
      hostname.endsWith(".youtube.com");

    if (!isYoutubeHost) {
      return null;
    }

    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.split("/").filter(Boolean)[1] ?? "";
    } else if (url.pathname.startsWith("/shorts/")) {
      videoId = url.pathname.split("/").filter(Boolean)[1] ?? "";
    } else {
      videoId = url.searchParams.get("v") ?? "";
    }

    if (!videoId) {
      return null;
    }

    const params = new URLSearchParams();
    params.set("rel", "0");

    const listId = url.searchParams.get("list");
    if (listId) {
      params.set("list", listId);
    }

    const query = params.toString();
    return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ""}`;
  } catch (_error) {
    return null;
  }
}
