export interface Exercise {
  name: string;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
  prompt_example: any[];
  ethical: {
    before: any[];
    after: any[];
  };
  miro_board: string;
  isCustom?: boolean;
  originalIndex?: number;
}

export type DriveType = "human" | "human-ai" | "ai";

export interface SelectedPinInfo {
  name: string;
  originalIndex: number;
  order: number;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

export type ExerciseData = Exercise; 