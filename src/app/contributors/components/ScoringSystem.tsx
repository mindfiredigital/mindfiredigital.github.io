"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

const ScoringSystem = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='mx-auto max-w-4xl px-4 mb-8'>
      {/* Toggle button */}
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
              How is the score calculated?
            </p>
            <p className='text-xs text-gray-400'>
              View the complete scoring formula
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

      {/* Collapsible content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[800px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className='bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6'>
          {/* Formula header */}
          <div className='text-center'>
            <span className='inline-block px-3 py-1 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-mf-red uppercase tracking-wider mb-3'>
              Scoring Formula
            </span>
            {/* Total score equation */}
            <div className='flex items-center justify-center gap-2 flex-wrap text-sm font-mono'>
              <span className='px-3 py-1.5 bg-red-50 border border-red-200 text-mindfire-text-red rounded-lg font-bold'>
                Total Score
              </span>
              <span className='text-gray-400 font-sans'>=</span>
              <span className='px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-bold'>
                Code Score
              </span>
              <span className='text-gray-400 font-sans'>+</span>
              <span className='px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-bold'>
                Quality Score
              </span>
              <span className='text-gray-400 font-sans'>+</span>
              <span className='px-3 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg font-bold'>
                Community Score
              </span>
            </div>
          </div>

          {/* Three columns */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {/* Code Score */}
            <div className='bg-blue-50 border border-blue-100 rounded-xl p-4'>
              <h4 className='text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-blue-400 inline-block' />
                Code Score
              </h4>
              <div className='space-y-2 text-xs text-blue-900/80 font-mono'>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    PR merged × <strong>5</strong> × complexity
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    Commits × <strong>2</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    PR reviews × <strong>3</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-blue-400 mt-0.5'>+</span>
                  <span>
                    Code comments × <strong>1</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Score */}
            <div className='bg-emerald-50 border border-emerald-100 rounded-xl p-4'>
              <h4 className='text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-400 inline-block' />
                Quality Score
              </h4>
              <div className='space-y-2 text-xs text-emerald-900/80 font-mono'>
                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    Impact bonus <strong>0–10</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    Has tests × <strong>2</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    Has docs × <strong>2</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    First-time mentor × <strong>5</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-emerald-400 mt-0.5'>+</span>
                  <span>
                    Zero revisions × <strong>3</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Community Score */}
            <div className='bg-violet-50 border border-violet-100 rounded-xl p-4'>
              <h4 className='text-xs font-bold text-violet-700 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-violet-400 inline-block' />
                Community Score
              </h4>
              <div className='space-y-2 text-xs text-violet-900/80 font-mono'>
                <div className='flex items-start gap-1.5'>
                  <span className='text-violet-400 mt-0.5'>+</span>
                  <span>
                    Issues opened × <strong>2</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-violet-400 mt-0.5'></span>
                  <span className='text-violet-400'>(cap: 10/month)</span>
                </div>
                <div className='flex items-start gap-1.5 mt-1'>
                  <span className='text-violet-400 mt-0.5'>+</span>
                  <span>
                    Issue comments × <strong>1</strong>
                  </span>
                </div>
                <div className='flex items-start gap-1.5'>
                  <span className='text-violet-400 mt-0.5'></span>
                  <span className='text-violet-400'>(cap: 20/month)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Complexity multiplier table */}
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

          {/* Impact bonus note */}
          <div className='bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-start gap-3'>
            <Info className='w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5' />
            <p className='text-xs text-gray-600'>
              <strong className='text-gray-800'>Impact bonus</strong> ranges
              from <code className='bg-gray-200 rounded px-1'>0</code> (none) →{" "}
              <code className='bg-gray-200 rounded px-1'>3</code> (low) →{" "}
              <code className='bg-gray-200 rounded px-1'>7</code> (high) →{" "}
              <code className='bg-gray-200 rounded px-1'>10</code> (critical),
              awarded per PR based on overall impact to the project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringSystem;
