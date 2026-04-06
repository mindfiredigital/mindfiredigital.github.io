"use client";

import { useEffect } from "react";
import clientLogger from "@/app/utils/clientLogger";
import { ERROR } from "@/constants";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /* Log the root-level error to the server on every error change */
  useEffect(() => {
    clientLogger.error("Global root-level error caught", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    /* global-error must own the full html/body since root layout has crashed */
    <html lang='en'>
      <body className='m-0 min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center font-serif'>
        {/* Centered content wrapper */}
        <div className='text-center px-8 py-16 max-w-[480px]'>
          {/* Critical error label — uses brand red token */}
          <p className='text-xs tracking-[0.2em] uppercase text-mf-red mb-6'>
            {ERROR.criticalError}
          </p>

          {/* Main heading */}
          <h1 className='text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.1] mb-4'>
            {ERROR.somethingWentWrong}
            <br />
            <em>{ERROR.seriouslyWrong}</em>
          </h1>

          {/* Supporting message */}
          <p className='text-[#888] leading-relaxed mb-8'>{ERROR.rootErroor}</p>

          {/* Error digest ID — only shown when available */}
          {error.digest && (
            <p className='font-mono text-xs text-[#555] mb-8'>
              {ERROR.errorID} {error.digest}
            </p>
          )}

          {/* Retry button — keeps dark-mode inverted style since this shell owns html/body */}
          <button
            onClick={reset}
            className='bg-transparent border border-[#f5f5f5] text-[#f5f5f5] px-8 py-3 text-sm tracking-[0.1em] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] hover:text-[#0a0a0a]'
          >
            {ERROR.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}
