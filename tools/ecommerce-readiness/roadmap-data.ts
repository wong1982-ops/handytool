import type { RoadmapItem } from './types';

export const ROADMAP_ITEMS: RoadmapItem[] = [
  // ─── Phase 1: Foundation (Week 1–2) ──────────────────────────────────────

  {
    id: 'p1-photos',
    phase: 1,
    phaseLabel: 'Foundation',
    phaseTimeline: 'Week 1–2',
    title: 'Take professional product photos',
    description:
      'Photograph each product on a clean white or neutral background with good natural light. Consistent, high-quality images are one of the biggest drivers of online sales.',
    cost: '~$0–$150 NZD (DIY or brief photographer session)',
    time: '2–4 hours',
    categoryId: 'business',
    triggerBelow: 60,
  },
  {
    id: 'p1-catalogue',
    phase: 1,
    phaseLabel: 'Foundation',
    phaseTimeline: 'Week 1–2',
    title: 'Define your product catalogue',
    description:
      'Write clear product titles, descriptions, and organise items into logical categories. Well-structured catalogues improve searchability and reduce customer confusion.',
    time: '3–5 hours',
    categoryId: 'business',
    triggerBelow: 60,
  },
  {
    id: 'p1-domain',
    phase: 1,
    phaseLabel: 'Foundation',
    phaseTimeline: 'Week 1–2',
    title: 'Register a domain name',
    description:
      'Secure a .co.nz or .com domain that matches your business name. A professional domain builds trust and makes it easier for customers to find you.',
    cost: '~$25 NZD/year',
    time: '30 minutes',
    categoryId: 'technical',
    triggerBelow: 60,
  },
  {
    id: 'p1-email',
    phase: 1,
    phaseLabel: 'Foundation',
    phaseTimeline: 'Week 1–2',
    title: 'Set up a business email address',
    description:
      'Create a professional email (e.g. hello@yourbusiness.co.nz) using Google Workspace or Zoho Mail. A business email looks credible and separates work from personal communications.',
    cost: '~$0–$10 NZD/month',
    time: '1–2 hours',
    categoryId: 'technical',
    triggerBelow: 50,
  },

  // ─── Phase 2: Setup (Week 3–4) ────────────────────────────────────────────

  {
    id: 'p2-account',
    phase: 2,
    phaseLabel: 'Setup',
    phaseTimeline: 'Week 3–4',
    title: 'Create your e-commerce platform account',
    description:
      'Sign up for your chosen platform (Shopify, Trade Me, Square Online, etc.) and complete the initial store configuration including store name, currency (NZD), and time zone.',
    time: '1–2 hours',
    categoryId: 'technical',
    triggerBelow: 80,
  },
  {
    id: 'p2-upload',
    phase: 2,
    phaseLabel: 'Setup',
    phaseTimeline: 'Week 3–4',
    title: 'Upload your products',
    description:
      'Add all products with photos, descriptions, prices (GST-inclusive), and stock levels. Double-check titles and descriptions for clarity before publishing.',
    time: '3–8 hours',
    categoryId: 'business',
    triggerBelow: 80,
  },
  {
    id: 'p2-shipping',
    phase: 2,
    phaseLabel: 'Setup',
    phaseTimeline: 'Week 3–4',
    title: 'Configure NZ shipping rates',
    description:
      'Set up accurate shipping zones and rates for NZ domestic delivery. Consider offering free shipping over a threshold to increase average order value.',
    time: '1–2 hours',
    categoryId: 'business',
    triggerBelow: 60,
  },
  {
    id: 'p2-payment',
    phase: 2,
    phaseLabel: 'Setup',
    phaseTimeline: 'Week 3–4',
    title: 'Set up your payment gateway',
    description:
      'Connect a payment provider such as Stripe, PayStation, or your platform\'s built-in gateway. Test a real transaction before launching to ensure everything works correctly.',
    time: '1–3 hours',
    categoryId: 'business',
    triggerBelow: 50,
  },

  // ─── Phase 3: Legal & Compliance (Week 3–4) ──────────────────────────────

  {
    id: 'p3-gst',
    phase: 3,
    phaseLabel: 'Legal & Compliance',
    phaseTimeline: 'Week 3–4',
    title: 'Register for GST if required',
    description:
      'If your turnover exceeds or is expected to exceed $60,000 NZD in a 12-month period, you must register for GST with Inland Revenue. Registration is free and can be done online through myIR.',
    cost: 'Free',
    time: '1–2 hours',
    categoryId: 'legal',
    triggerBelow: 60,
  },
  {
    id: 'p3-privacy',
    phase: 3,
    phaseLabel: 'Legal & Compliance',
    phaseTimeline: 'Week 3–4',
    title: 'Write a privacy policy',
    description:
      'Publish a privacy policy that explains how you collect, store, and use customer data in compliance with the NZ Privacy Act 2020. Free templates are available from the Office of the Privacy Commissioner.',
    cost: 'Free (template available)',
    time: '1–2 hours',
    categoryId: 'legal',
    triggerBelow: 60,
  },
  {
    id: 'p3-returns',
    phase: 3,
    phaseLabel: 'Legal & Compliance',
    phaseTimeline: 'Week 3–4',
    title: 'Add returns and refund terms',
    description:
      'Publish clear returns and refund terms on your store. Under the Consumer Guarantees Act, customers have rights to refunds for faulty goods — your policy should reflect these obligations.',
    time: '1 hour',
    categoryId: 'legal',
    triggerBelow: 60,
  },
  {
    id: 'p3-gst-pricing',
    phase: 3,
    phaseLabel: 'Legal & Compliance',
    phaseTimeline: 'Week 3–4',
    title: 'Display GST-inclusive pricing',
    description:
      'NZ consumer law requires prices displayed to NZ customers to include GST. Review all product prices and ensure your store shows GST-inclusive amounts prominently.',
    time: '30 minutes – 1 hour',
    categoryId: 'legal',
    triggerBelow: 50,
  },
  {
    id: 'p3-cga',
    phase: 3,
    phaseLabel: 'Legal & Compliance',
    phaseTimeline: 'Week 3–4',
    title: 'Understand the Consumer Guarantees Act',
    description:
      'Review your obligations under the Consumer Guarantees Act and Fair Trading Act. The Consumer Protection website (consumerprotection.govt.nz) has free guides for online sellers.',
    cost: 'Free',
    time: '1–2 hours',
    categoryId: 'legal',
    triggerBelow: 50,
  },

  // ─── Phase 4: Launch & Market (Week 5–6) ─────────────────────────────────

  {
    id: 'p4-gmb',
    phase: 4,
    phaseLabel: 'Launch & Market',
    phaseTimeline: 'Week 5–6',
    title: 'Set up Google My Business',
    description:
      'Create or optimise your Google Business Profile with your store link, hours, photos, and contact details. This drives free local search traffic and builds credibility.',
    cost: 'Free',
    time: '1–2 hours',
    categoryId: 'marketing',
    triggerBelow: 60,
  },
  {
    id: 'p4-social',
    phase: 4,
    phaseLabel: 'Launch & Market',
    phaseTimeline: 'Week 5–6',
    title: 'Create launch social media posts',
    description:
      'Announce your online store across your social channels with engaging photos, your store link, and a launch offer or discount code to encourage first purchases.',
    time: '2–3 hours',
    categoryId: 'marketing',
    triggerBelow: 60,
  },
  {
    id: 'p4-email-launch',
    phase: 4,
    phaseLabel: 'Launch & Market',
    phaseTimeline: 'Week 5–6',
    title: 'Send a launch email to existing customers',
    description:
      'Email your existing customers or contact list to announce your new online store. Include a direct link and a special launch incentive — existing customers convert at much higher rates than cold audiences.',
    time: '1–2 hours',
    categoryId: 'marketing',
    triggerBelow: 50,
  },
  {
    id: 'p4-ads',
    phase: 4,
    phaseLabel: 'Launch & Market',
    phaseTimeline: 'Week 5–6',
    title: 'Consider running a small online ad',
    description:
      'Start with a small budget ($50–$100 NZD) on Facebook/Instagram or Google Ads targeting your local area. Focus on one product or offer, measure the results, and scale what works.',
    cost: '~$50–$100 NZD (test budget)',
    time: '2–3 hours to set up',
    categoryId: 'marketing',
    triggerBelow: 40,
  },
];
