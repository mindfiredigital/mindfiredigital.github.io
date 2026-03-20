export default function Loading() {
  return (
    /* Page wrapper with max width and centered layout */
    <div className='px-8 py-8 max-w-[1100px] mx-auto'>
      {/* Skeleton header block */}
      <div className='mb-10'>
        {/* Skeleton title bar */}
        <div className='skeleton h-8 w-[38%] mb-3' />

        {/* Skeleton subtitle bar */}
        <div className='skeleton h-4 w-[22%]' />
      </div>

      {/* Skeleton card grid — 6 placeholder cards */}
      <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5'>
        {Array.from({ length: 6 }).map((_, i) => (
          /* Individual skeleton card */
          <div
            key={i}
            className='border border-mf-border rounded-lg overflow-hidden'
          >
            {/* Skeleton image placeholder */}
            <div className='skeleton h-[180px]' />

            {/* Skeleton text lines */}
            <div className='p-4 flex flex-col gap-2'>
              {/* Wide line */}
              <div className='skeleton h-3.5 w-[90%]' />

              {/* Medium line */}
              <div className='skeleton h-3.5 w-[65%]' />

              {/* Short line */}
              <div className='skeleton h-3.5 w-[40%]' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
