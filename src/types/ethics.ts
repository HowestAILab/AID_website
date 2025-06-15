export interface EthicalLens {
    type: 'virtue' | 'consequentialist' | 'deontologist' | 'care' | 'contract' | 'existential';
    name: string;
    description: string;
  }
  
  export interface MainCapital {
    type: 'human' | 'economic' | 'natural';
    subtype?: string;
    name: string;
    description: string;
  }
  
  export interface EthicalSettings {
    zoomingState: 'in' | 'out';
    mainCapital: MainCapital;
    ethicalLens: EthicalLens;
  }
  
  export interface EthicalQuestion {
    id: string;
    question: string;
    type: 'text' | 'rating' | 'multiple-choice';
    options?: string[];
    required: boolean;
  }
  
  export interface EthicalCheck {
    id: string;
    exerciseId: string;
    timing: 'before' | 'after';
    settings: EthicalSettings;
    questions: EthicalQuestion[];
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    responses?: Record<string, any>;
    generatedAt: string;
    completedAt?: string;
  }
  
  export interface EthicalCheckResult {
    checkId: string;
    responses: Record<string, any>;
    isBlocking: boolean;
    recommendations?: string[];
    completedAt: string;
  }
  
  export const ETHICAL_LENSES: EthicalLens[] = [
    {
      type: 'virtue',
      name: 'Virtue Ethics',
      description: 'Focus on character and moral virtues'
    },
    {
      type: 'consequentialist',
      name: 'Consequentialist',
      description: 'Focus on outcomes and consequences'
    },
    {
      type: 'deontologist',
      name: 'Deontological',
      description: 'Focus on duties and rules'
    },
    {
      type: 'care',
      name: 'Ethics of Care',
      description: 'Focus on relationships and care'
    },
    {
      type: 'contract',
      name: 'Social Contract',
      description: 'Focus on social agreements and fairness'
    },
    {
      type: 'existential',
      name: 'Existential Ethics',
      description: 'Focus on individual freedom and responsibility'
    }
  ];
  
  export const MAIN_CAPITALS: MainCapital[] = [
    {
      type: 'human',
      name: 'Human Capital',
      description: 'Focus on human wellbeing, skills, and development'
    },
    {
      type: 'economic',
      name: 'Economic Capital',
      description: 'Focus on financial and economic impacts'
    },
    {
      type: 'natural',
      name: 'Natural Capital',
      description: 'Focus on environmental and ecological impacts'
    }
  ];