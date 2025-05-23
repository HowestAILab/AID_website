export interface Exercise {
  name: string;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
  prompt_example: any[];
  etchical: {
    before: any[];
    after: any[];
  };
  miro_board: string;
  isCustom?: boolean;
}

export interface SelectedPinInfo {
  name: string;
  originalIndex: number;
  order: number;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
}

export type ExerciseData = Exercise; 