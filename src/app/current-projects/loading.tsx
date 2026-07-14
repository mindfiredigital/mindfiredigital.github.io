/* Skeleton for the Current Projects page — mirrors src/app/current-projects/page.tsx layout */
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

      {/* Project grid */}
      <div className='mb-20'>
        <section className='mt-20'>
          <div className='flex justify-center items-center gap-4'>
            <div className='skeleton h-9 w-56' />
            <div className='skeleton h-7 w-12 rounded-full' />
          </div>

          <div className='mt-12 px-8 grid gap-6 max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='border-2 p-6 bg-slate-50/70 h-80 flex flex-col gap-3'>
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
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
