import type {
  AssessmentResult,
  CategoryScore,
  CostEstimate,
  PlatformRecommendation,
  UserAnswers,
} from './types';
import { CATEGORIES, QUESTIONS } from './questions';

// ─── Platform definitions ────────────────────────────────────────────────────

const PLATFORMS: Record<string, PlatformRecommendation> = {
  trademe: {
    name: 'Trade Me',
    tagline: "New Zealand's largest online marketplace",
    monthlyCost: 0,
    processingFee: '7.9% success fee',
    pros: ["NZ's largest marketplace", 'No website needed', 'Built-in buyer traffic'],
    cons: ['Limited branding', 'Fees on every sale', 'Less control'],
    whyFits:
      'With limited technical experience, Trade Me lets you start selling immediately with zero setup — your products reach millions of NZ buyers straight away.',
  },
  shopify: {
    name: 'Shopify',
    tagline: 'All-in-one e-commerce platform',
    monthlyCost: 39,
    processingFee: '2.9% + $0.30',
    pros: ['Easy setup', 'NZ payment gateways', 'Professional themes'],
    cons: ['Monthly cost', 'Transaction fees on top', 'App costs add up'],
    whyFits:
      'Shopify strikes the right balance between ease of use and professional features — ideal for NZ businesses ready to own their online store without needing deep technical skills.',
  },
  squareonline: {
    name: 'Square Online',
    tagline: 'Free online store with POS integration',
    monthlyCost: 0,
    processingFee: '2.6% + $0.10',
    pros: ['Free tier available', 'POS integration', 'Simple setup'],
    cons: ['Limited customisation', 'Basic free tier', 'Less NZ-specific'],
    whyFits:
      'Square Online is great if you already use Square for in-person payments — you can go online for free and sync your inventory across physical and digital sales.',
  },
  woocommerce: {
    name: 'WooCommerce',
    tagline: 'Self-hosted e-commerce on WordPress',
    monthlyCost: 20,
    processingFee: '2.9% + $0.30 (Stripe)',
    pros: ['Full control', 'Thousands of plugins', 'Lowest long-term cost'],
    cons: ['Technical skill needed', 'Self-managed hosting', 'Security responsibility'],
    whyFits:
      'With strong technical skills and an existing CMS site, WooCommerce gives you maximum flexibility and control — and is the most cost-effective option at scale.',
  },
  stripe: {
    name: 'Stripe / PayStation',
    tagline: 'Add payments to your existing website',
    monthlyCost: 0,
    processingFee: '2.9% + $0.30',
    pros: ['Add to existing site', 'NZ-based (PayStation)', 'No platform lock-in'],
    cons: ['Need existing website', 'More DIY', 'No storefront included'],
    whyFits:
      'Since you already have a website, adding a payment gateway like Stripe or the NZ-based PayStation is the fastest path to accepting online payments without rebuilding anything.',
  },
};

// ─── Category score calculation ──────────────────────────────────────────────

function computeCategoryScores(answers: UserAnswers): CategoryScore[] {
  return CATEGORIES.map((cat) => {
    const catQuestions = QUESTIONS.filter((q) => q.category === cat.id);
    const maxPossible = catQuestions.length * 10;
    const achieved = catQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    const score = maxPossible > 0 ? Math.round((achieved / maxPossible) * 100) : 0;
    return { categoryId: cat.id, label: cat.label, score, weight: cat.weight };
  });
}

// ─── Overall score label ─────────────────────────────────────────────────────

function scoreLabel(score: number): string {
  if (score >= 80) return 'Ready to Launch!';
  if (score >= 60) return 'Almost There';
  if (score >= 40) return 'Needs Work';
  return 'Early Stage';
}

// ─── Platform recommendation logic ───────────────────────────────────────────

export function recommendPlatforms(
  answers: UserAnswers,
  categoryScores: CategoryScore[],
): [PlatformRecommendation, PlatformRecommendation] {
  const techScore = categoryScores.find((c) => c.categoryId === 'technical')?.score ?? 0;
  const hasWebsite = (answers['t3'] ?? 0) === 10;

  let primary: PlatformRecommendation;
  let secondary: PlatformRecommendation;

  if (techScore < 40) {
    primary = PLATFORMS.trademe;
    secondary = PLATFORMS.shopify;
  } else if (techScore < 50) {
    primary = PLATFORMS.shopify;
    secondary = PLATFORMS.trademe;
  } else if (hasWebsite) {
    primary = PLATFORMS.stripe;
    secondary = PLATFORMS.woocommerce;
  } else if (techScore >= 70) {
    primary = PLATFORMS.woocommerce;
    secondary = PLATFORMS.shopify;
  } else {
    // techScore >= 50, no website
    primary = PLATFORMS.squareonline;
    secondary = PLATFORMS.shopify;
  }

  return [primary, secondary];
}

// ─── Cost estimate ────────────────────────────────────────────────────────────

export function estimateCosts(platform: PlatformRecommendation): CostEstimate {
  const domainYearly = 25;
  const firstYearTotal = platform.monthlyCost * 12 + domainYearly;
  return {
    platform: platform.name,
    monthlyFee: platform.monthlyCost,
    processingNote: platform.processingFee,
    domainYearly,
    firstYearTotal,
  };
}

// ─── Main calculation ─────────────────────────────────────────────────────────

export function calculateScores(answers: UserAnswers): AssessmentResult {
  const categoryScores = computeCategoryScores(answers);

  const overallScore = Math.round(
    categoryScores.reduce((sum, cs) => sum + cs.score * cs.weight, 0),
  );

  const [primaryRecommendation, secondaryRecommendation] = recommendPlatforms(
    answers,
    categoryScores,
  );

  const costEstimate = estimateCosts(primaryRecommendation);

  return {
    overallScore,
    label: scoreLabel(overallScore),
    categoryScores,
    primaryRecommendation,
    secondaryRecommendation,
    costEstimate,
  };
}
