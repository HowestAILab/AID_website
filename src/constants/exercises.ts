export const TAB_NAMES = ["Discover", "Define", "Develop", "Deliver"];

export const LOCAL_STORAGE_KEYS = {
  CUSTOM_EXERCISES: "customDesignExercises",
  DIAMOND_EXERCISES: "diamondExercises",
} as const;

export const PHASE_CATEGORY_MAPPING: Record<string, string[]> = {
  Discover: ["Prepare (Discover)", "Discover"],
  Define: ["Define", "Synthesise (Define)"],
  Develop: ["Prepare (Develop)", "Develop"],
  Deliver: ["Deliver", "Synthesise (Deliver)"],
}; 