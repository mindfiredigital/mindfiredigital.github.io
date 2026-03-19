export default function Loading() {
  return (
    /* Page wrapper with max width and centered layout */
    <div className='px-8 py-8 max-w-[1100px] mx-auto'>
      {/* Skeleton header block */}
      <div className='mb-10'>
        {/* Skeleton title bar */}
        <div className='h-8 w-[38%] rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer mb-3' />

        {/* Skeleton subtitle bar */}
        <div className='h-4 w-[22%] rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer' />
      </div>

      {/* Skeleton card grid — 6 placeholder cards */}
      <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5'>
        {Array.from({ length: 6 }).map((_, i) => (
          /* Individual skeleton card */
          <div
            key={i}
            className='border border-gray-100 rounded-lg overflow-hidden'
          >
            {/* Skeleton image placeholder */}
            <div className='h-[180px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer' />

            {/* Skeleton text lines */}
            <div className='p-4 flex flex-col gap-2'>
              {/* Wide line */}
              <div className='h-3.5 w-[90%] rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer' />

              {/* Medium line */}
              <div className='h-3.5 w-[65%] rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer' />

              {/* Short line */}
              <div className='h-3.5 w-[40%] rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
