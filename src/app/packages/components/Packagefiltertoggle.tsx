"use client";

import React from "react";
import { FilterType } from "@/types";
import { FILTER_OPTIONS } from "@/constants";
import { FilterOption, PackageFilterToggleProps } from "@/types";

/**
 * PackageFilterToggle Component
 *
 * Provides a toggle UI for filtering packages by type
 * (e.g., All, npm, PyPI, NuGet, etc.).
 *
 * The component renders a set of filter buttons based on
 * predefined options and highlights the currently active filter.
 */
export default function PackageFilterToggle({
  activeFilter,
  onChange,
}: PackageFilterToggleProps) {
  return (
    /**
     * Wrapper container providing spacing for the filter toggle
     */
    <div className='mt-4 flex items-center'>
      {/* Toggle button group container */}
      <div className='relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm p-1 gap-1'>
        {/**
         * Iterate through filter options and render a button for each.
         * The active filter is visually highlighted.
         */}
        {(FILTER_OPTIONS as readonly FilterOption[]).map((opt) => (
          <button
            key={opt.value}
            /**
             * When a filter is clicked, update the active filter
             * in the parent component via the onChange callback.
             */
            onClick={() => onChange(opt.value as FilterType)}
            /**
             * Conditional styling:
             * - Active filter gets gradient background and white text
             * - Inactive filters show neutral text with hover effect
             */
            className={`relative z-10 px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none ${
              activeFilter === opt.value
                ? "bg-gradient-to-r from-mindfire-text-red to-orange-500 text-white shadow-md"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
