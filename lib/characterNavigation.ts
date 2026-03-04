export type NavigationCharacter = "music" | "photo" | "drone" | "blog";

type SearchParamValue = string | string[] | undefined;

const VALID_CHARACTERS = new Set<NavigationCharacter>(["music", "photo", "drone", "blog"]);

export function normalizeNavigationCharacter(value: SearchParamValue): NavigationCharacter | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) {
    return null;
  }

  const normalizedValue = rawValue.toLowerCase();
  return VALID_CHARACTERS.has(normalizedValue as NavigationCharacter)
    ? (normalizedValue as NavigationCharacter)
    : null;
}

export function buildCharacterHref(pathname: string, character?: NavigationCharacter) {
  if (!character) {
    return pathname;
  }

  return `${pathname}?character=${character}`;
}
