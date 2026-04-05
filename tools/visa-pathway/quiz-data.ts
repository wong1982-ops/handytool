import type { QuizQuestion } from './types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'who',
    question: 'Who are you?',
    options: [
      { label: 'A migrant wanting to move to New Zealand', value: 'migrant' },
      { label: 'Already in New Zealand on a visa', value: 'in-nz' },
      { label: 'An employer looking to hire from overseas', value: 'employer' },
    ],
  },
  {
    id: 'location',
    question: 'Where are you right now?',
    options: [
      { label: 'Outside New Zealand', value: 'outside' },
      { label: 'In NZ on a Student Visa', value: 'student-visa' },
      { label: 'In NZ on a Work Visa', value: 'work-visa' },
      { label: 'In NZ on a Visitor Visa', value: 'visitor' },
      { label: 'NZ citizen or permanent resident', value: 'citizen' },
    ],
  },
  {
    id: 'qualification',
    question: 'What is your highest qualification?',
    options: [
      { label: 'PhD or Doctorate', value: 'phd' },
      { label: "Master's degree", value: 'masters' },
      { label: "Bachelor's degree", value: 'bachelors' },
      { label: 'Diploma or certificate (Level 7)', value: 'diploma' },
      { label: 'Trade or vocational qualification', value: 'trade' },
      { label: 'High school / secondary education', value: 'high-school' },
      { label: 'No formal qualification', value: 'none' },
    ],
  },
  {
    id: 'experience',
    question: 'How many years of skilled work experience do you have?',
    options: [
      { label: 'No experience yet', value: '0' },
      { label: '1–2 years', value: '1-2' },
      { label: '3–5 years', value: '3-5' },
      { label: '6–9 years', value: '6-9' },
      { label: '10 or more years', value: '10+' },
    ],
  },
  {
    id: 'jobOffer',
    question: 'Do you have a job offer in New Zealand?',
    options: [
      { label: 'Yes — for a Green List occupation', value: 'yes-green-list' },
      { label: 'Yes — for another occupation', value: 'yes-other' },
      { label: 'No, but I am actively looking', value: 'no' },
      { label: 'Not applicable / I am an employer', value: 'na' },
    ],
  },
  {
    id: 'age',
    question: 'What is your age?',
    options: [
      { label: 'Under 25', value: 'under-25' },
      { label: '25–29', value: '25-29' },
      { label: '30–39', value: '30-39' },
      { label: '40–44', value: '40-44' },
      { label: '45–49', value: '45-49' },
      { label: '50–55', value: '50-55' },
      { label: 'Over 55', value: 'over-55' },
    ],
  },
]
