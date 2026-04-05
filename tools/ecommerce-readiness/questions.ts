import type { CategoryInfo, Question } from './types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'business', label: 'Business Readiness', weight: 0.30, icon: '🏪' },
  { id: 'technical', label: 'Technical Readiness', weight: 0.20, icon: '💻' },
  { id: 'legal', label: 'Legal & Compliance', weight: 0.25, icon: '⚖️' },
  { id: 'marketing', label: 'Marketing & Reach', weight: 0.25, icon: '📣' },
];

export const QUESTIONS: Question[] = [
  // Business (b1–b5)
  {
    id: 'b1',
    category: 'business',
    question: 'How would you describe your product catalogue?',
    options: [
      { label: 'Well-defined with clear descriptions and organised categories', score: 10 },
      { label: 'Mostly defined but some details still need work', score: 5 },
      { label: 'Still figuring out exactly what I want to sell', score: 0 },
    ],
  },
  {
    id: 'b2',
    category: 'business',
    question: 'Do you have professional product photos ready?',
    options: [
      { label: 'Yes — high-quality photos on clean backgrounds', score: 10 },
      { label: 'Some photos but not consistent quality', score: 5 },
      { label: 'No photos yet', score: 0 },
    ],
  },
  {
    id: 'b3',
    category: 'business',
    question: 'Have you set your pricing strategy including shipping?',
    options: [
      { label: 'Yes — prices set and shipping rates calculated', score: 10 },
      { label: 'Prices set but shipping still needs work', score: 5 },
      { label: 'Not yet', score: 0 },
    ],
  },
  {
    id: 'b4',
    category: 'business',
    question: 'What payment methods do you currently accept?',
    options: [
      { label: 'EFTPOS in-store and online payments', score: 10 },
      { label: 'EFTPOS in-store only', score: 5 },
      { label: 'Cash only', score: 0 },
    ],
  },
  {
    id: 'b5',
    category: 'business',
    question: 'How do you currently track your inventory?',
    options: [
      { label: 'Digital inventory management system', score: 10 },
      { label: 'Spreadsheet or manual tracking', score: 5 },
      { label: 'No formal tracking yet', score: 0 },
    ],
  },

  // Technical (t1–t4)
  {
    id: 't1',
    category: 'technical',
    question: 'Do you have a domain name for your business?',
    options: [
      { label: 'Yes — I own a domain name already', score: 10 },
      { label: 'I have one in mind but haven\'t registered it', score: 5 },
      { label: 'No domain name yet', score: 0 },
    ],
  },
  {
    id: 't2',
    category: 'technical',
    question: 'How would you rate your digital skills?',
    options: [
      { label: 'Confident — I can set up and manage online tools myself', score: 10 },
      { label: 'Basic — I can follow instructions but need some help', score: 5 },
      { label: 'I would need significant help getting started', score: 0 },
    ],
  },
  {
    id: 't3',
    category: 'technical',
    question: 'Do you currently have a website?',
    options: [
      { label: 'Yes — built on a CMS like WordPress or Squarespace', score: 10 },
      { label: 'Yes — a static or basic website', score: 5 },
      { label: 'No website yet', score: 0 },
    ],
  },
  {
    id: 't4',
    category: 'technical',
    question: 'How do you currently communicate with customers?',
    options: [
      { label: 'Email plus a CRM or mailing list tool', score: 10 },
      { label: 'Email only', score: 5 },
      { label: 'Mainly by phone or in person', score: 0 },
    ],
  },

  // Legal (l1–l5)
  {
    id: 'l1',
    category: 'legal',
    question: 'Is your business registered for GST?',
    hint: 'GST registration is required if your turnover exceeds $60,000 NZD per year.',
    options: [
      { label: 'Yes — registered for GST', score: 10 },
      { label: 'Not yet but planning to register soon', score: 5 },
      { label: 'No and I\'m not sure if I need to', score: 0 },
    ],
  },
  {
    id: 'l2',
    category: 'legal',
    question: 'Are you familiar with the Consumer Guarantees Act?',
    options: [
      { label: 'Yes — I understand my obligations as an online seller', score: 10 },
      { label: 'Somewhat — I know it exists but need to review the details', score: 5 },
      { label: 'No — I\'m not familiar with it', score: 0 },
    ],
  },
  {
    id: 'l3',
    category: 'legal',
    question: 'Do you have a privacy policy that complies with the NZ Privacy Act 2020?',
    options: [
      { label: 'Yes — privacy policy in place and up to date', score: 10 },
      { label: 'Working on it', score: 5 },
      { label: 'No privacy policy yet', score: 0 },
    ],
  },
  {
    id: 'l4',
    category: 'legal',
    question: 'Have you documented your returns and refund terms?',
    options: [
      { label: 'Yes — clear written returns and refund policy', score: 10 },
      { label: 'Informal policy but not written down', score: 5 },
      { label: 'No formal returns policy', score: 0 },
    ],
  },
  {
    id: 'l5',
    category: 'legal',
    question: 'Is your business registered with the Companies Office?',
    options: [
      { label: 'Yes — registered company or sole trader on the register', score: 10 },
      { label: 'In progress', score: 5 },
      { label: 'Not registered', score: 0 },
    ],
  },

  // Marketing (m1–m4)
  {
    id: 'm1',
    category: 'marketing',
    question: 'Do you have active social media accounts for your business?',
    options: [
      { label: 'Yes — active on multiple platforms', score: 10 },
      { label: 'Yes — active on one platform', score: 5 },
      { label: 'No social media presence', score: 0 },
    ],
  },
  {
    id: 'm2',
    category: 'marketing',
    question: 'Is your business listed on Google My Business?',
    options: [
      { label: 'Yes — fully optimised with photos and reviews', score: 10 },
      { label: 'Listed but not fully set up', score: 5 },
      { label: 'Not listed on Google My Business', score: 0 },
    ],
  },
  {
    id: 'm3',
    category: 'marketing',
    question: 'Do you have an email list or customer contact list?',
    options: [
      { label: 'Yes — 100+ contacts or subscribers', score: 10 },
      { label: 'Small list of a few contacts', score: 5 },
      { label: 'No email list yet', score: 0 },
    ],
  },
  {
    id: 'm4',
    category: 'marketing',
    question: 'Have you run online advertising before (Google Ads, Meta Ads, etc.)?',
    options: [
      { label: 'Yes — run ads regularly with good results', score: 10 },
      { label: 'Tried it once but didn\'t continue', score: 5 },
      { label: 'Never run online ads', score: 0 },
    ],
  },
];
