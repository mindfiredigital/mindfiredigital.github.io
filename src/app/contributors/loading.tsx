/* Skeleton for the Contributors page — mirrors ContributorsClient.tsx layout */
function FilterSidebarSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='skeleton h-9 w-full rounded-md' />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-2 pb-4 border-b border-gray-100'>
          <div className='skeleton h-4 w-24' />
          <div className='skeleton h-3 w-full' />
          <div className='skeleton h-3 w-[75%]' />
        </div>
      ))}
    </div>
  );
}

function TopScorersPanelSkeleton() {
  return (
    <div className='flex flex-col rounded-2xl border border-gray-100 shadow-lg bg-white overflow-hidden'>
      <div className='p-4 border-b border-gray-100 flex items-center justify-between'>
        <div className='skeleton h-5 w-28' />
        <div className='skeleton h-5 w-16' />
      </div>
      <div className='p-4 flex flex-col gap-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <div className='skeleton h-8 w-8 rounded-full flex-shrink-0' />
            <div className='flex-1 flex flex-col gap-1.5'>
              <div className='skeleton h-3 w-[70%]' />
              <div className='skeleton h-2.5 w-[40%]' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <section className='bg-slate-50 min-h-screen overflow-x-hidden'>
      <div className='flex w-full' style={{ minHeight: "calc(100vh - 4.5rem)" }}>
        {/* Left sidebar (desktop) */}
        <aside className='hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-gray-100 p-4'>
          <FilterSidebarSkeleton />
        </aside>

        {/* Main content */}
        <main className='flex-1 min-w-0'>
          {/* Hero */}
          <div className='flex flex-col items-center text-center pt-10 px-6'>
            <div className='flex items-center justify-center gap-4'>
              <div className='skeleton h-10 w-64' />
              <div className='skeleton h-7 w-12 rounded-full' />
            </div>

            <div className='mt-6 w-full max-w-2xl'>
              <div className='skeleton h-6 w-72 mx-auto mb-3' />
              <div className='skeleton h-5 w-[80%] mx-auto' />
            </div>

            {/* Top contributors carousel row */}
            <div className='mt-8 w-full flex justify-center gap-4 overflow-hidden'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex flex-col items-center gap-2 flex-shrink-0'>
                  <div className='skeleton h-16 w-16 rounded-full' />
                  <div className='skeleton h-3 w-16' />
                </div>
              ))}
            </div>

            {/* Scoring accordion */}
            <div className='skeleton mt-4 mb-2 w-full max-w-3xl h-12 rounded-lg' />
          </div>

          {/* Top scorers (mobile) */}
          <div className='lg:hidden px-4 mt-6'>
            <TopScorersPanelSkeleton />
          </div>

          {/* Filters (mobile) */}
          <div className='lg:hidden px-4 mt-4'>
            <FilterSidebarSkeleton />
          </div>

          {/* Contributor list */}
          <div className='mt-12 pb-16 px-6'>
            <div className='flex items-center justify-center gap-4 mb-8'>
              <div className='skeleton h-8 w-56' />
              <div className='skeleton h-7 w-20 rounded-full' />
            </div>

            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='bg-white border border-mf-border-soft rounded-2xl p-5 flex flex-col gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='skeleton h-11 w-11 rounded-full flex-shrink-0' />
                    <div className='flex-1 flex flex-col gap-1.5'>
                      <div className='skeleton h-4 w-[60%]' />
                      <div className='skeleton h-3 w-[40%]' />
                    </div>
                  </div>
                  <div className='flex gap-3'>
                    <div className='skeleton h-3 w-12' />
                    <div className='skeleton h-3 w-12' />
                    <div className='skeleton h-3 w-12' />
                  </div>
                  <div className='skeleton h-8 w-full rounded-lg' />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right sidebar (desktop top scorers) */}
        <div className='hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-l border-gray-100 p-4'>
          <TopScorersPanelSkeleton />
        </div>
      </div>
    </section>
  );
}
