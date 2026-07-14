/* Skeleton for the Projects page — mirrors src/app/projects/page.tsx layout */
function ProjectCardSkeleton({ short }: { short?: boolean }) {
  return (
    <div className={`border-2 p-6 bg-slate-50/70 flex flex-col gap-3 ${short ? "h-52" : "h-80"}`}>
      <div className='flex justify-between items-start'>
        <div className='skeleton h-5 w-2/3' />
        <div className='skeleton h-6 w-12 rounded-full' />
      </div>
      <div className='skeleton h-3.5 w-full' />
      <div className='skeleton h-3.5 w-[90%]' />
      <div className='skeleton h-3.5 w-[70%]' />
      <div className='mt-auto flex gap-2'>
        <div className='skeleton h-5 w-14 rounded-full' />
        <div className='skeleton h-5 w-14 rounded-full' />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      {/* Hero */}
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0 w-full'>
            <div className='skeleton h-10 w-full max-w-lg mb-2' />
            <div className='skeleton h-10 w-[70%] max-w-lg mb-6' />
            <div className='skeleton h-5 w-full mb-2' />
            <div className='skeleton h-5 w-[80%] mb-10' />
            <div className='skeleton h-12 w-40 rounded-full' />
          </div>
          <div className='skeleton max-lg:w-full w-[600px] h-[500px] flex-shrink-0' />
        </div>
      </section>

      <section className='mt-10 mb-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Current Projects heading */}
          <div className='mb-8 flex justify-center items-center gap-4'>
            <div className='skeleton h-8 w-56' />
            <div className='skeleton h-7 w-12 rounded-full' />
          </div>

          <div className='flex flex-col lg:flex-row gap-6 items-start'>
            {/* Sidebar */}
            <aside className='lg:w-72 flex-shrink-0 w-full'>
              <div className='border border-mf-border rounded-lg p-4 flex flex-col gap-4'>
                <div className='skeleton h-9 w-full rounded-md' />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex flex-col gap-2'>
                    <div className='skeleton h-4 w-24' />
                    <div className='skeleton h-3 w-full' />
                    <div className='skeleton h-3 w-[80%]' />
                  </div>
                ))}
              </div>
            </aside>

            {/* Current + upcoming project grids */}
            <div className='flex-1 min-w-0 w-full'>
              <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>

              <div className='mt-20'>
                <div className='skeleton h-8 w-56 mx-auto mb-8' />
                <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ProjectCardSkeleton key={i} short />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
