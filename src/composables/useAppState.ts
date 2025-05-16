import { ref, computed } from 'vue';

export type Exercise = {
  name: string;
  description: string;
  location: {
    phase: string;
    human_ai_scale: number;
  };
  prompt_example: string[];
  etchical: {
    before: string[];
    after: string[];
  };
  miro_board: string;
};

export type WorkflowItem = {
  toolname: string;
  position: number;
  notes: string[];
  chat_history: string[];
};

export type FrameworkState = {
  framework: {
    exercises: Exercise[];
    workflow: WorkflowItem[];
  };
};

const defaultState: FrameworkState = {
  framework: {
    exercises: [],
    workflow: [],
  },
};

const state = ref<FrameworkState>({ ...defaultState });

const loadState = (json: FrameworkState) => {
  state.value = json;
};

const saveState = () => {
  return state.value;
};

export function useAppState() {
  return {
    state,
    loadState,
    saveState,
  };
}
