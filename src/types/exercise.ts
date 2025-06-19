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

// New types for zoom-out ethics exercises
export interface EthicsExercise {
  id: string;
  name: string;
  description: string;
  type: 'initial' | 'intermediate' | 'final' | 'custom';
  position: number; // Position in pipeline (0-1 for predefined, specific index for custom)
  settings: {
    ethicalLens: string;
    mainCapital: string;
    zoomingState: 'out'; // Always 'out' for pipeline-level ethics
  };
  questions: Array<{
    id: string;
    question: string;
    type: 'text' | 'rating' | 'multiple-choice';
    required: boolean;
  }>;
  completed: boolean;
  responses?: Record<string, any>;
  completedAt?: number;
  pipelineContext?: {
    totalExercises: number;
    completedExercises: number;
    currentPhase: string;
    allPhases: string[];
  };
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
  // New property to distinguish ethics exercises
  isEthicsExercise?: boolean;
  ethicsExerciseData?: EthicsExercise;
}

export type ExerciseData = Exercise; 