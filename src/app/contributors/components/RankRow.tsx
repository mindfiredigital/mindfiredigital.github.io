import { TopScorer } from "@/types";

/* Single row displaying ranked contributor with score and progress */
export function RankRow({
  scorer,
  rank,
  pct,
  accentClass,
  onViewDetails,
}: {
  scorer: TopScorer;
  rank: number;
  pct: number;
  accentClass: string;
  onViewDetails: (c: TopScorer) => void;
}) {
  return (
    <button
      onClick={() => onViewDetails(scorer)}
      className='w-full flex items-center gap-2 group rounded-xl px-2.5 py-2 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-150 text-left'
    >
      {/* Rank badge */}
      <span
        className={`flex-shrink-0 w-[22px] h-[22px] rounded-md border text-[10px] font-black flex items-center justify-center ${accentClass}`}
      >
        {rank}
      </span>

      {/* User avatar */}
      <img
        src={scorer.avatar_url}
        alt={scorer.username}
        className='w-7 h-7 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-red-200 transition-all flex-shrink-0'
      />

      {/* Username + progress bar */}
      <div className='flex-1 min-w-0'>
        <p className='text-[11px] font-bold text-gray-800 truncate group-hover:text-mf-red transition-colors leading-none mb-1'>
          {scorer.username}
        </p>

        {/* Score percentage bar */}
        <div className='h-1 w-full bg-gray-100 rounded-full overflow-hidden'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-mindfire-text-red to-orange-400 transition-all duration-700'
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Score value */}
      <span className='flex-shrink-0 text-[11px] font-bold text-gray-500 group-hover:text-mf-red transition-colors tabular-nums'>
        {scorer.total_score.toLocaleString()}
      </span>
    </button>
  );
}
