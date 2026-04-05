'use client';

import { useState } from 'react';
import { QUESTIONS, CATEGORIES } from './questions';
import type { UserAnswers } from './types';

interface QuizWizardProps {
  onComplete: (answers: UserAnswers) => void;
  onBack: () => void;
}

export default function QuizWizard({ onComplete, onBack }: QuizWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [advancing, setAdvancing] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentCategory = CATEGORIES.find((c) => c.id === currentQuestion.category)!;
  const categoryIndex = CATEGORIES.findIndex((c) => c.id === currentQuestion.category);
  const selectedScore = answers[currentQuestion.id];
  const hasAnswer = selectedScore !== undefined;

  function handleSelectOption(score: number) {
    if (advancing) return;

    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);
    setAdvancing(true);

    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex((i) => i + 1);
        setAdvancing(false);
      } else {
        onComplete(newAnswers);
      }
    }, 300);
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      onBack();
    }
  }

  function handleNext() {
    if (!hasAnswer) return;
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete(answers);
    }
  }

  const progressPercent = (currentIndex / QUESTIONS.length) * 100;

  return (
    <div className="flex flex-col min-h-full">
      {/* Progress bar */}
      <div className="w-full h-1 bg-[#1e2631] mb-6 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#3D6AF2] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Category label */}
      <div className="mb-4">
        <span className="text-[12px] uppercase tracking-wider text-[#6b7280] font-medium">
          {currentCategory.icon} {currentCategory.label} {categoryIndex + 1}/4
        </span>
      </div>

      {/* Question card */}
      <div className="max-w-2xl mx-auto w-full rounded-xl bg-[#131a23] border border-[#1e2631] p-6 mb-6">
        <div className="mb-3">
          <span className="text-[14px] text-[#6b7280] font-mono">Q{currentIndex + 1}</span>
        </div>
        <h2 className="text-[18px] font-bold text-white leading-snug">
          {currentQuestion.question}
        </h2>
        {currentQuestion.hint && (
          <p className="text-[13px] text-[#6b7280] mt-1 leading-relaxed">
            {currentQuestion.hint}
          </p>
        )}

        {/* Answer options */}
        <div className="mt-4 space-y-3">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedScore === option.score;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(option.score)}
                disabled={advancing}
                className={[
                  'rounded-xl border p-4 w-full text-left cursor-pointer transition-all duration-150',
                  'flex items-start gap-3',
                  isSelected
                    ? 'ring-2 ring-[#3D6AF2] bg-[#3D6AF2]/5 border-[#3D6AF2]/40'
                    : 'bg-[#131a23] border-[#1e2631] hover:bg-[#1e2631]',
                  advancing && !isSelected ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')}
              >
                {/* Radio circle */}
                <span
                  className={[
                    'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150',
                    isSelected
                      ? 'border-[#3D6AF2] bg-[#3D6AF2]'
                      : 'border-[#374151] bg-transparent',
                  ].join(' ')}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </span>

                {/* Label */}
                <span className="flex-1 text-[14px] text-white leading-snug">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom actions row */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between mt-auto pt-2">
        <button
          onClick={handleBack}
          className="text-[14px] text-[#6b7280] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-[#1e2631] min-h-[44px] flex items-center"
        >
          ← Back
        </button>

        <span className="text-[13px] text-[#6b7280]">
          Q{currentIndex + 1} of {QUESTIONS.length}
        </span>

        <button
          onClick={handleNext}
          disabled={!hasAnswer || advancing}
          className={[
            'text-[14px] font-medium px-5 py-2 rounded-lg min-h-[44px] flex items-center transition-all duration-150',
            hasAnswer && !advancing
              ? 'bg-[#3D6AF2] text-white hover:bg-[#3D6AF2]/90'
              : 'bg-[#1e2631] text-[#6b7280] cursor-not-allowed',
          ].join(' ')}
        >
          {currentIndex === QUESTIONS.length - 1 ? 'See Results →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
