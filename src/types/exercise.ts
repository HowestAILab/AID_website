export interface EthicsRequirement {
  lens: string;
  capital: string;
  zoomingState: string;
  questions: string[];
}

export interface Exercise {
  name: string;
  description: string;
  location: {
    phase: string;
    step: string;
    human_ai_scale: number;
  };
  prompt_example: string[];
  ethical: {
    before: EthicsRequirement[] | EthicsRequirement;
    after: EthicsRequirement[] | EthicsRequirement;
  };
  miro_board: string;
  how_to_run: string[];
  expected_outcomes: string[];
  human_ai_collaboration: {
    human_role: string;
    ai_role: string;
    collaboration_notes: string;
  };
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
  ethical?: {
    before: EthicsRequirement[] | EthicsRequirement;
    after: EthicsRequirement[] | EthicsRequirement;
  };
}

export type ExerciseData = Exercise; 