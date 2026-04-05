'use client';

import { ROADMAP_ITEMS } from './roadmap-data';
import type { AssessmentResult, UserAnswers, RoadmapItem } from './types';

interface RoadmapViewProps {
  result: AssessmentResult;
  answers: UserAnswers;
  progress: Record<string, boolean>;
  onToggleItem: (id: string) => void;
  onExportPdf: () => void;
  onBack: () => void;
}

interface PhaseGroup {
  phase: number;
  phaseLabel: string;
  phaseTimeline: string;
  items: RoadmapItem[];
}

export default function RoadmapView({
  result,
  answers: _answers,
  progress,
  onToggleItem,
  onExportPdf,
  onBack,
}: RoadmapViewProps) {
  // Filter items: only show where the category score is below triggerBelow
  const relevantItems = ROADMAP_ITEMS.filter((item) => {
    const categoryScore = result.categoryScores.find((c) => c.categoryId === item.categoryId);
    if (!categoryScore) return false;
    return categoryScore.score < item.triggerBelow;
  });

  // Group by phase
  const phaseMap = new Map<number, PhaseGroup>();
  for (const item of relevantItems) {
    if (!phaseMap.has(item.phase)) {
      phaseMap.set(item.phase, {
        phase: item.phase,
        phaseLabel: item.phaseLabel,
        phaseTimeline: item.phaseTimeline,
        items: [],
      });
    }
    phaseMap.get(item.phase)!.items.push(item);
  }
  const phases = Array.from(phaseMap.values()).sort((a, b) => a.phase - b.phase);

  // Overall completion
  const totalItems = relevantItems.length;
  const completedItems = relevantItems.filter((item) => progress[item.id]).length;
  const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">

      {/* Overall progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-semibold text-white">Your Action Plan</span>
          <span className="text-[13px] text-[#9ca3af]">
            {completedItems} of {totalItems} steps completed
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#1e2631] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3D6AF2] rounded-full transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Phase cards */}
      {totalItems === 0 ? (
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-[18px] font-bold text-white mb-2">You&apos;re well prepared!</h3>
          <p className="text-[14px] text-[#9ca3af]">
            Your scores are strong across all categories. No critical action items were found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {phases.map((phaseGroup) => {
            const phaseDone = phaseGroup.items.filter((item) => progress[item.id]).length;
            const phaseTotal = phaseGroup.items.length;

            return (
              <div
                key={phaseGroup.phase}
                className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5"
              >
                {/* Phase header */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h3 className="text-[16px] font-bold text-white">
                    Phase {phaseGroup.phase} — {phaseGroup.phaseLabel}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#1e2631] text-[#9ca3af]">
                      {phaseGroup.phaseTimeline}
                    </span>
                    <span className="text-[12px] text-[#9ca3af]">
                      {phaseDone}/{phaseTotal} done
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {phaseGroup.items.map((item) => {
                    const isChecked = !!progress[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => onToggleItem(item.id)}
                        className="w-full flex items-start gap-3 text-left group rounded-lg p-2 -mx-2 hover:bg-[#1e2631] transition-colors duration-100"
                      >
                        {/* Checkbox */}
                        <span
                          className={[
                            'mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150',
                            isChecked
                              ? 'bg-[#3D6AF2] border-[#3D6AF2]'
                              : 'border-[#374151] bg-transparent group-hover:border-[#3D6AF2]/60',
                          ].join(' ')}
                        >
                          {isChecked && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={[
                              'text-[14px] font-medium leading-snug',
                              isChecked
                                ? 'line-through text-[#6b7280]'
                                : 'text-white',
                            ].join(' ')}
                          >
                            {item.title}
                          </p>
                          <p className="text-[12px] text-[#6b7280] mt-0.5 leading-snug">
                            {item.description}
                          </p>
                          {(item.cost || item.time) && (
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {item.cost && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                                  {item.cost}
                                </span>
                              )}
                              {item.time && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1e2631] text-[#9ca3af]">
                                  ⏱ {item.time}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pb-4">
        <button
          onClick={onExportPdf}
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] hover:opacity-90 transition-opacity"
        >
          Download Full Report
        </button>
        <button
          onClick={onBack}
          className="text-[14px] text-[#6b7280] hover:text-white transition-colors"
        >
          ← Back to Results
        </button>
      </div>
    </div>
  );
}
