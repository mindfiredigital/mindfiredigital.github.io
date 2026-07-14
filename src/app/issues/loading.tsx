/* Skeleton for the Issues page — mirrors src/app/issues/page.tsx layout */
export default function Loading() {
  return (
    <section className='bg-mf-bg-subtle min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'>
        {/* Hero */}
        <div className='flex flex-col items-center pt-10 pb-8 text-center'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='skeleton h-10 w-56' />
            <div className='skeleton h-7 w-12 rounded-full' />
          </div>
          <div className='skeleton h-5 w-[80%] max-w-xl mt-1' />
          <div className='skeleton h-3 w-40 mt-3' />
        </div>

        <div className='flex gap-6 items-start'>
          {/* Sidebar */}
          <aside className='hidden lg:block lg:w-72 flex-shrink-0'>
            <div className='border border-mf-border rounded-lg p-4 flex flex-col gap-4 bg-white'>
              <div className='skeleton h-9 w-full rounded-md' />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex flex-col gap-2 pb-4 border-b border-gray-100'>
                  <div className='skeleton h-4 w-24' />
                  <div className='skeleton h-3 w-full' />
                  <div className='skeleton h-3 w-[75%]' />
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className='flex-1 min-w-0'>
            {/* Results bar */}
            <div className='flex items-center justify-between mb-4'>
              <div className='skeleton h-4 w-48' />
              <div className='skeleton h-4 w-24' />
            </div>

            {/* Issue rows */}
            <div className='space-y-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className='bg-white border border-mf-border rounded-xl p-5 flex gap-4'
                >
                  <div className='skeleton flex-shrink-0 w-[38px] h-[38px] rounded-full' />
                  <div className='flex-1 min-w-0'>
                    <div className='flex gap-2 mb-2'>
                      <div className='skeleton h-5 w-20 rounded-full' />
                      <div className='skeleton h-5 w-16 rounded-full' />
                      <div className='skeleton h-5 w-10 rounded-full' />
                    </div>
                    <div className='skeleton h-4 w-[85%] mb-2' />
                    <div className='skeleton h-3 w-40' />
                  </div>
                  <div className='hidden sm:flex flex-shrink-0 items-center'>
                    <div className='skeleton h-9 w-28 rounded-full' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
