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
        {/* Error badge label — uses brand red token */}
        <span className='badge-mf-red text-[0.7rem] rounded-sm mb-5 inline-block'>
          {ERROR.error}
        </span>

        {/* Main error heading */}
        <h2 className='text-3xl font-semibold text-mf-dark mb-3 leading-tight'>
          {ERROR.somethingWentWrong}
        </h2>

        {/* Error description — shows digest ID if available */}
        <p className='text-mf-light-grey text-sm leading-relaxed mb-8'>
          {error.digest
            ? `An unexpected error occurred (ID: ${error.digest}).`
            : "An unexpected error occurred. Please try again."}
        </p>

        {/* Action buttons row */}
        <div className='flex gap-3 justify-center flex-wrap'>
          {/* Primary action — retry the failed render */}
          <button
            onClick={reset}
            className='btn-mf-primary rounded text-sm py-2.5'
          >
            {ERROR.tryAgain}
          </button>

          {/* Secondary action — navigate back to home */}
          <button
            onClick={() => (window.location.href = "/")}
            className='btn-mf-secondary rounded text-sm py-2.5'
          >
            {ERROR.goHome}
          </button>
        </div>
      </div>
    </div>
  );
}
