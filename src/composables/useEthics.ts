import { ref, watch } from "vue";
import type { EthicalCheck, EthicalQuestion, EthicalSettings, EthicalLens, MainCapital } from "@/types/ethics";
import { ETHICAL_LENSES, MAIN_CAPITALS } from "@/types/ethics";

const LOCAL_STORAGE_KEY = "ethicalChecks";

interface CreateCheckOptions {
  exerciseId: string;
  timing: "before" | "after";
  questions: Omit<EthicalQuestion, "id">[];
  settings: EthicalSettings;
  contextData?: Record<string, any>;
}

// Helper to find lens/capital by type string
const findLensByType = (type: string): EthicalLens => {
  return ETHICAL_LENSES.find(lens => lens.type === type) || ETHICAL_LENSES[0];
};

const findCapitalByType = (type: string): MainCapital => {
  return MAIN_CAPITALS.find(capital => capital.type === type) || MAIN_CAPITALS[0];
};

// Helper to extract ethics data from exercise (supports both old and new formats)
const extractEthicsData = (exercise: any, timing: "before" | "after") => {
  const ethicalData = exercise.ethical?.[timing];
  if (!ethicalData) return null;
  
  // New format (object with lens, capital, questions)
  if (typeof ethicalData === 'object' && !Array.isArray(ethicalData)) {
    return {
      questions: ethicalData.questions || [],
      settings: {
        zoomingState: ethicalData.zoomingState || 'in',
        mainCapital: findCapitalByType(ethicalData.capital || 'human'),
        ethicalLens: findLensByType(ethicalData.lens || 'virtue'),
      } as EthicalSettings
    };
  }
  
  // Old format (array of strings) - fallback
  if (Array.isArray(ethicalData)) {
    return {
      questions: ethicalData,
      settings: {
        zoomingState: 'in',
        mainCapital: MAIN_CAPITALS[0],
        ethicalLens: ETHICAL_LENSES[0],
      } as EthicalSettings
    };
  }
  
  return null;
};

export function useEthics() {
  const ethicalChecks = ref<Record<string, EthicalCheck>>({});
  const contextData = ref<Record<string, any>>({});

  // --- persistence helpers --------------------------------------------------
  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        ethicalChecks.value = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to parse stored ethical checks", err);
      ethicalChecks.value = {};
    }
  };

  const persist = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ethicalChecks.value));
  };

  // Load immediately
  loadFromStorage();

  // Persist on changes
  watch(ethicalChecks, persist, { deep: true });

  // --- internal helpers -----------------------------------------------------
  const makeKey = (exerciseId: string, timing: "before" | "after") => `${exerciseId}:${timing}`;

  const createCheck = ({ exerciseId, timing, questions, settings, contextData: ctx }: CreateCheckOptions): EthicalCheck => {
    const key = makeKey(exerciseId, timing);
    const formattedQuestions: EthicalQuestion[] = questions.map((q, idx) => ({ ...q, id: `${key}:q${idx}` }));

    const check: EthicalCheck = {
      id: key,
      exerciseId,
      timing,
      settings,
      questions: formattedQuestions,
      status: "pending",
      generatedAt: new Date().toISOString(),
    };
    ethicalChecks.value[key] = check;
    
    // Store context data if provided
    if (ctx) {
      contextData.value[key] = ctx;
    }
    
    return check;
  };

  // --- public API -----------------------------------------------------------
  const getEthicalCheck = (exerciseId: string, timing: "before" | "after") => {
    return ethicalChecks.value[makeKey(exerciseId, timing)] || null;
  };

  const ensureEthicalCheck = (options: CreateCheckOptions) => {
    return getEthicalCheck(options.exerciseId, options.timing) || createCheck(options);
  };

  const ensureEthicalCheckFromExercise = (exercise: any, timing: "before" | "after", ctx?: Record<string, any>) => {
    const ethicsData = extractEthicsData(exercise, timing);
    if (!ethicsData) return null;
    
    const questions = ethicsData.questions.map((q: string) => ({ 
      question: q, 
      type: 'text' as const, 
      required: true 
    }));
    
    return ensureEthicalCheck({
      exerciseId: exercise.name,
      timing,
      questions,
      settings: ethicsData.settings,
      contextData: ctx
    });
  };

  const markCompleted = (
    exerciseId: string,
    timing: "before" | "after",
    responses: Record<string, any>
  ) => {
    const key = makeKey(exerciseId, timing);
    const check = ethicalChecks.value[key];
    if (!check) return;
    check.status = "completed";
    check.responses = responses;
    check.completedAt = new Date().toISOString();
  };

  const isCompleted = (exerciseId: string, timing: "before" | "after") => {
    const check = getEthicalCheck(exerciseId, timing);
    return check?.status === "completed";
  };

  const hasEthics = (exercise: any, timing: "before" | "after") => {
    const ethicsData = extractEthicsData(exercise, timing);
    return ethicsData && ethicsData.questions.length > 0;
  };

  const setContextData = (exerciseId: string, timing: "before" | "after", data: Record<string, any>) => {
    const key = makeKey(exerciseId, timing);
    contextData.value[key] = data;
  };

  const getContextData = (exerciseId: string, timing: "before" | "after") => {
    const key = makeKey(exerciseId, timing);
    return contextData.value[key] || {};
  };

  return {
    ethicalChecks,
    contextData,
    getEthicalCheck,
    ensureEthicalCheck,
    ensureEthicalCheckFromExercise,
    markCompleted,
    isCompleted,
    hasEthics,
    extractEthicsData,
    setContextData,
    getContextData,
  };
} 