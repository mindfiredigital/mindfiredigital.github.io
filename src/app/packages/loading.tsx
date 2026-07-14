/* Skeleton for the Packages/Stats page — mirrors src/app/packages/page.tsx layout */
export default function Loading() {
  return (
    <section className='bg-slate-50'>
      <div className='container mx-auto flex flex-col gap-4 items-center'>
        {/* Heading + count badge */}
        <div className='flex items-center gap-4 mt-10'>
          <div className='skeleton h-10 w-64' />
          <div className='skeleton h-7 w-12 rounded-full' />
        </div>

        {/* Subheading */}
        <div className='skeleton h-5 w-[70%] max-w-2xl mt-6' />
        <div className='skeleton h-5 w-[50%] max-w-xl' />

        {/* Total downloads pill */}
        <div className='skeleton h-11 w-52 rounded-full mt-2' />

        {/* Filter toggle */}
        <div className='skeleton h-9 w-72 rounded-full mt-4' />

        {/* Package card grid */}
        <div className='w-full'>
          <div className='mt-8 px-8 grid gap-6 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='border p-4 rounded bg-white flex flex-col justify-between w-full max-w-xs h-48'
              >
                <div className='flex flex-row items-start justify-between'>
                  <div className='skeleton h-4 w-24 ml-2' />
                  <div className='flex flex-col items-end gap-1'>
                    <div className='skeleton h-5 w-16' />
                    <div className='skeleton h-3 w-14' />
                  </div>
                </div>
                <div className='flex flex-row items-center justify-between mt-auto'>
                  <div className='skeleton h-8 w-8 rounded' />
                  <div className='flex gap-2'>
                    <div className='skeleton h-8 w-8 rounded' />
                    <div className='skeleton h-8 w-8 rounded' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
