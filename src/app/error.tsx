"use client";

import { useEffect } from "react";
import clientLogger from "@/app/utils/clientLogger";
import { ERROR } from "@/constants";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /* Log the error to the server via clientLogger on every error change */
  useEffect(() => {
    clientLogger.error("Route-level error caught", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    /* Full-height centered layout */
    <div className='min-h-[60vh] flex items-center justify-center px-4 py-16'>
      {/* Inner card container */}
      <div className='max-w-md w-full text-center'>
        {/* Error badge label */}
        <span className='inline-block text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-sm mb-5'>
          {ERROR.error}
        </span>

        {/* Main error heading */}
        <h2 className='text-3xl font-semibold text-gray-900 mb-3 leading-tight'>
          {ERROR.somethingWentWrong}
        </h2>

        {/* Error description — shows digest ID if available */}
        <p className='text-gray-500 text-sm leading-relaxed mb-8'>
          {error.digest
            ? `An unexpected error occurred (ID: ${error.digest}).`
            : "An unexpected error occurred. Please try again."}
        </p>

        {/* Action buttons row */}
        <div className='flex gap-3 justify-center flex-wrap'>
          {/* Primary action — retry the failed render */}
          <button
            onClick={reset}
            className='bg-gray-900 text-white border border-gray-900 px-6 py-2.5 text-sm font-medium rounded hover:opacity-80 transition-opacity'
          >
            {ERROR.tryAgain}
          </button>

          {/* Secondary action — navigate back to home */}
          <button
            onClick={() => (window.location.href = "/")}
            className='bg-transparent text-gray-900 border border-gray-300 px-6 py-2.5 text-sm font-medium rounded hover:bg-gray-50 transition-colors'
          >
            {ERROR.goHome}
          </button>
        </div>
      </div>
    </div>
  );
}
