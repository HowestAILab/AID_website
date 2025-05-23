export const TABS = ["Discover", "Define", "Develop", "Deliver"] as const;

export const SECTION_LABEL_TEXTS = [
  "prepare",
  "discover",
  "define",
  "synthesise",
  "prepare",
  "develop",
  "deliver",
  "synthesise",
] as const;

export const FULL_HEIGHT_LINE_INDICES = [0, 2, 4, 6, 8] as const;

export const IMAGE_WIDTH_SCALE_FACTOR = 0.892;

export const DEFAULT_KONVA_CONFIG = {
  width: 834,
  height: 420,
  x: 0,
  y: 0,
} as const;

export const DEFAULT_IMAGE_CONFIG = {
  width: 834,
  height: 420,
  x: 0,
} as const;

export const IMAGE_ASPECT_RATIO = 420 / 834; 