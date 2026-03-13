"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  CODE_SCORE_ITEMS,
  COMMUNITY_SCORE_ITEMS,
  QUALITY_SCORE_ITEMS,
  SCORING_SYSTEM_LABELS,
} from "@/constants";

const ScoringSystem = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='mx-auto max-w-4xl px-4 mb-8'>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className='w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-200 group'
      >
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0'>
            <Info className='w-3.5 h-3.5 text-mf-red' />
          </div>
          <div className='text-left'>
            <p className='text-sm font-semibold text-gray-800'>
              {SCORING_SYSTEM_LABELS.triggerHeading}
            </p>
            <p className='text-xs text-gray-400'>
              {SCORING_SYSTEM_LABELS.triggerSubheading}
            </p>
          </div>
        </div>
        <div className='text-gray-400 group-hover:text-mf-red transition-colors flex-shrink-0'>
          {isOpen ? (
            <ChevronUp className='w-4 h-4' />
          ) : (
            <ChevronDown className='w-4 h-4' />
          )}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[900px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className='bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6'>
          <div className='text-center'>
            <span className='inline-block px-3 py-1 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-mf-red uppercase tracking-wider mb-3'>
              {SCORING_SYSTEM_LABELS.badge}
            </span>
            <div className='flex items-center justify-center gap-2 flex-wrap text-sm font-mono'>
              <span className='px-3 py-1.5 bg-red-50 border border-red-200 text-mindfire-text-red rounded-lg font-bold'>
                {SCORING_SYSTEM_LABELS.totalScore}
              </span>
              <span className='text-gray-400 font-sans'>=</span>
              <span className='px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-bold'>
                {SCORING_SYSTEM_LABELS.codeScore}
              </span>
              <span className='text-gray-400 font-sans'>+</span>
              <span className='px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-bold'>
                {SCORING_SYSTEM_LABELS.qualityScore}
              </span>
              <span className='text-gray-400 font-sans'>+</span>
              <span className='px-3 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg font-bold'>
                {SCORING_SYSTEM_LABELS.communityScore}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='bg-blue-50 border border-blue-100 rounded-xl p-4'>
              <h4 className='text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-blue-400 inline-block' />
                {SCORING_SYSTEM_LABELS.codeScore}
              </h4>
              <div className='space-y-2 text-xs text-blue-900/80 font-mono'>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    {CODE_SCORE_ITEMS[0].label} ×{" "}
                    <strong>{CODE_SCORE_ITEMS[0].multiplier}</strong>{" "}
                    {CODE_SCORE_ITEMS[0].suffix}
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    {CODE_SCORE_ITEMS[1].label} ×{" "}
                    <strong>{CODE_SCORE_ITEMS[1].multiplier}</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    [CODE_SCORE_ITEMS[2].label] ×{" "}
                    <strong>{CODE_SCORE_ITEMS[2].multiplier}</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    {CODE_SCORE_ITEMS[3].label} ×{" "}
                    <strong>{CODE_SCORE_ITEMS[3].multiplier}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-emerald-50 border border-emerald-100 rounded-xl p-4'>
              <h4 className='text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-400 inline-block' />
                {SCORING_SYSTEM_LABELS.qualityScore}
              </h4>

              <div className='space-y-2 text-xs text-emerald-900/80 font-mono'>
                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    {QUALITY_SCORE_ITEMS[0].label} ×{" "}
                    <strong>{QUALITY_SCORE_ITEMS[0].multiplier}</strong>
                  </span>
                </div>

                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    {QUALITY_SCORE_ITEMS[1].label} ×{" "}
                    <strong>{QUALITY_SCORE_ITEMS[1].multiplier}</strong>
                  </span>
                </div>

                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    {QUALITY_SCORE_ITEMS[2].label} ×{" "}
                    <strong>{QUALITY_SCORE_ITEMS[2].multiplier}</strong>
                  </span>
                </div>

                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    {QUALITY_SCORE_ITEMS[3].label} ×{" "}
                    <strong>{QUALITY_SCORE_ITEMS[3].multiplier}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-violet-50 border border-violet-100 rounded-xl p-4'>
              <h4 className='text-xs font-bold text-violet-700 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-violet-400 inline-block' />
                {SCORING_SYSTEM_LABELS.communityScore}
              </h4>

              <div className='space-y-2 text-xs text-violet-900/80 font-mono'>
                <div className='flex items-start gap-1.5'>
                  <span className='text-violet-400 mt-0.5'>+</span>
                  <span>
                    {COMMUNITY_SCORE_ITEMS[0].label} ×{" "}
                    <strong>{COMMUNITY_SCORE_ITEMS[0].multiplier}</strong>
                  </span>
                </div>

                <div className='flex items-start gap-1.5'>
                  <span className='text-violet-400 mt-0.5'></span>
                  <span className='text-violet-400'>
                    ({COMMUNITY_SCORE_ITEMS[0].cap})
                  </span>
                </div>

                <div className='flex items-start gap-1.5 mt-1'>
                  <span className='text-violet-400 mt-0.5'>+</span>
                  <span>
                    {COMMUNITY_SCORE_ITEMS[1].label} ×{" "}
                    <strong>{COMMUNITY_SCORE_ITEMS[1].multiplier}</strong>
                  </span>
                </div>

                <div className='flex items-start gap-1.5'>
                  <span className='text-violet-400 mt-0.5'></span>
                  <span className='text-violet-400'>
                    ({COMMUNITY_SCORE_ITEMS[1].cap})
                  </span>
                </div>

                <div className='flex items-start gap-1.5 mt-1 pt-1.5'>
                  <span className='text-violet-400 mt-0.5'>+</span>
                  <span>
                    {COMMUNITY_SCORE_ITEMS[2].label} ×{" "}
                    <strong>{COMMUNITY_SCORE_ITEMS[2].multiplier}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className='text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 text-center'>
              PR Complexity Multipliers
            </h4>
            <div className='grid grid-cols-3 gap-3'>
              {[
                {
                  label: "effort:small",
                  multiplier: "×1.0",
                  desc: "1–2 files, <100 lines",
                  color: "bg-green-50 border-green-200 text-green-800",
                  badge: "bg-green-100 text-green-700",
                },
                {
                  label: "effort:medium",
                  multiplier: "×1.3",
                  desc: "3–7 files, moderate",
                  color: "bg-yellow-50 border-yellow-200 text-yellow-800",
                  badge: "bg-yellow-100 text-yellow-700",
                },
                {
                  label: "effort:large",
                  multiplier: "×1.7",
                  desc: "8+ files, architecture",
                  color: "bg-red-50 border-red-200 text-red-800",
                  badge: "bg-red-100 text-red-700",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`border rounded-xl p-3 text-center ${item.color}`}
                >
                  <p
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${item.badge}`}
                  >
                    {item.label}
                  </p>
                  <p className='text-xl font-black font-mono'>
                    {item.multiplier}
                  </p>
                  <p className='text-[10px] mt-1 opacity-70'>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringSystem;
