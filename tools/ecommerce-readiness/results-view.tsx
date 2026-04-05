'use client';

import type { AssessmentResult } from './types';

interface ResultsViewProps {
  result: AssessmentResult;
  onViewRoadmap: () => void;
  onExportPdf: () => void;
  isAuthenticated: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // green
  if (score >= 60) return '#F59E0B'; // amber
  if (score >= 40) return '#F97316'; // orange
  return '#EF4444'; // red
}

function getCategoryBarColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#3D6AF2';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export default function ResultsView({
  result,
  onViewRoadmap,
  onExportPdf,
  isAuthenticated,
}: ResultsViewProps) {
  const scoreColor = getScoreColor(result.overallScore);
  const { primaryRecommendation: primary, secondaryRecommendation: secondary, costEstimate } = result;

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* 1. Score circle */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <div
          className="w-[120px] h-[120px] rounded-full border-4 flex items-center justify-center"
          style={{ borderColor: scoreColor }}
        >
          <span className="text-[48px] font-bold text-white leading-none">
            {result.overallScore}
          </span>
        </div>
        <span className="text-[18px] font-semibold" style={{ color: scoreColor }}>
          {result.label}
        </span>
        <span className="text-[14px] text-[#9ca3af] text-center">
          Your business scores {result.overallScore}/100 for e-commerce readiness
        </span>
      </div>

      {/* 2. Category breakdown */}
      <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5">
        <h3 className="text-[14px] font-semibold text-white mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {result.categoryScores.map((cat) => {
            const barColor = getCategoryBarColor(cat.score);
            const needsAttention = cat.score < 50;
            return (
              <div key={cat.categoryId}>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-[#9ca3af] w-40 flex-shrink-0">
                    {cat.label}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-[#1e2631] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.score}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <span className="text-[14px] text-white w-10 text-right flex-shrink-0">
                    {cat.score}%
                  </span>
                </div>
                {needsAttention && (
                  <div className="mt-1 ml-[11.5rem]">
                    <span className="text-[12px] text-amber-400">⚠️ Needs attention</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Platform recommendation */}
      <div>
        <h3 className="text-[14px] font-semibold text-white mb-3">Platform Recommendation</h3>

        {/* Primary card */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <span className="text-[12px] px-3 py-1 rounded-full bg-[#3D6AF2]/20 text-[#3D9DF2] font-medium">
              Recommended for you
            </span>
            <span className="text-[12px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
              ${primary.monthlyCost}/mo NZD
            </span>
          </div>

          <h4 className="text-[20px] font-bold text-white leading-tight">{primary.name}</h4>
          <p className="text-[14px] text-[#9ca3af] mt-1 mb-4">{primary.tagline}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                Pros
              </p>
              <ul className="space-y-1">
                {primary.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#d1d5db]">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                Cons
              </p>
              <ul className="space-y-1">
                {primary.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#d1d5db]">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[13px] text-[#9ca3af] italic border-t border-[#1e2631] pt-3">
            {primary.whyFits}
          </p>
        </div>

        {/* Secondary card */}
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 mt-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[12px] text-[#6b7280]">Also consider:</span>
            <span className="text-[15px] font-semibold text-white">{secondary.name}</span>
            <span className="text-[13px] text-[#9ca3af] flex-1">{secondary.tagline}</span>
            <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">
              ${secondary.monthlyCost}/mo NZD
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cost estimate */}
      <div>
        <div className="rounded-xl bg-[#131a23] border border-[#1e2631] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e2631]">
            <h3 className="text-[14px] font-semibold text-white">
              Estimated First-Year Cost (NZD)
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2631]">
                <th className="px-4 py-2 text-left text-[12px] text-[#6b7280] font-medium">
                  Item
                </th>
                <th className="px-4 py-2 text-right text-[12px] text-[#6b7280] font-medium">
                  Monthly
                </th>
                <th className="px-4 py-2 text-right text-[12px] text-[#6b7280] font-medium">
                  Annual
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#1e2631]">
                <td className="px-4 py-3 text-[13px] text-[#d1d5db]">
                  {costEstimate.platform} platform fee
                </td>
                <td className="px-4 py-3 text-[13px] text-white text-right">
                  ${costEstimate.monthlyFee}
                </td>
                <td className="px-4 py-3 text-[13px] text-white text-right">
                  ${costEstimate.monthlyFee * 12}
                </td>
              </tr>
              <tr className="border-b border-[#1e2631]">
                <td className="px-4 py-3 text-[13px] text-[#d1d5db]">
                  Payment processing
                  <span className="block text-[11px] text-[#6b7280]">
                    {costEstimate.processingNote}
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#9ca3af] text-right">varies</td>
                <td className="px-4 py-3 text-[13px] text-[#9ca3af] text-right">varies</td>
              </tr>
              <tr className="border-b border-[#1e2631]">
                <td className="px-4 py-3 text-[13px] text-[#d1d5db]">Domain name</td>
                <td className="px-4 py-3 text-[13px] text-[#9ca3af] text-right">—</td>
                <td className="px-4 py-3 text-[13px] text-white text-right">
                  ${costEstimate.domainYearly}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-semibold text-white">
                  First Year Total
                </td>
                <td className="px-4 py-3 text-right" />
                <td className="px-4 py-3 text-[14px] font-semibold text-white text-right">
                  ${costEstimate.firstYearTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pb-4">
        <button
          onClick={onViewRoadmap}
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] hover:opacity-90 transition-opacity"
        >
          View Action Plan →
        </button>
        <button
          onClick={onExportPdf}
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-[14px] font-medium text-[#d1d5db] bg-[#131a23] border border-[#1e2631] hover:bg-[#1e2631] transition-colors flex items-center justify-center gap-2"
        >
          {!isAuthenticated && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-[#6b7280]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
          Download PDF
        </button>
      </div>
    </div>
  );
}
