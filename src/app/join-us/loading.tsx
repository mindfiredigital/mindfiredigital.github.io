/* Skeleton for the Join Us page — mirrors src/app/join-us/page.tsx layout */
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

      {/* Getting started steps */}
      <section className='mt-[6rem] max-w-6xl mx-auto px-6 mb-24'>
        <div className='skeleton h-8 w-80 mx-auto mb-4' />
        <div className='skeleton h-4 w-full max-w-4xl mx-auto mb-2' />
        <div className='skeleton h-4 w-[60%] max-w-4xl mx-auto' />

        <div className='mt-16 grid gap-11 max-w-3xl mx-auto'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex gap-4'>
              <div className='skeleton h-11 w-10 flex-shrink-0' />
              <div className='flex-1 flex flex-col gap-3'>
                <div className='skeleton h-5 w-40' />
                <div className='skeleton h-4 w-full' />
                <div className='skeleton h-4 w-[80%]' />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
