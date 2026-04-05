export interface AnswerOption {
  label: string;
  score: number;
}

export interface Question {
  id: string;
  category: CategoryId;
  question: string;
  hint?: string;
  options: [AnswerOption, AnswerOption, AnswerOption];
}

export type CategoryId = 'business' | 'technical' | 'legal' | 'marketing';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  weight: number;
  icon: string;
}

export type UserAnswers = Record<string, number>;

export interface CategoryScore {
  categoryId: CategoryId;
  label: string;
  score: number;
  weight: number;
}

export interface PlatformRecommendation {
  name: string;
  tagline: string;
  monthlyCost: number;
  processingFee: string;
  pros: string[];
  cons: string[];
  whyFits: string;
}

export interface CostEstimate {
  platform: string;
  monthlyFee: number;
  processingNote: string;
  domainYearly: number;
  firstYearTotal: number;
}

export interface AssessmentResult {
  overallScore: number;
  label: string;
  categoryScores: CategoryScore[];
  primaryRecommendation: PlatformRecommendation;
  secondaryRecommendation: PlatformRecommendation;
  costEstimate: CostEstimate;
}

export interface RoadmapItem {
  id: string;
  phase: number;
  phaseLabel: string;
  phaseTimeline: string;
  title: string;
  description: string;
  cost?: string;
  time?: string;
  categoryId: CategoryId;
  triggerBelow: number;
}

export type WizardStep = 'welcome' | 'quiz' | 'results' | 'roadmap';
