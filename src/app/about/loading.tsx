/* Skeleton for the About page — mirrors src/app/about/page.tsx layout */
export default function Loading() {
  return (
    <>
      {/* Hero */}
      <section className='bg-mf-bg-subtle'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0 w-full'>
            <div className='skeleton h-10 w-full max-w-lg mb-2' />
            <div className='skeleton h-10 w-[70%] max-w-lg mb-6' />

            <div className='skeleton h-5 w-full mb-2' />
            <div className='skeleton h-5 w-[80%] mb-10' />

            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <div className='skeleton h-11 w-40 rounded-full' />
              <div className='skeleton h-11 w-40 rounded-full' />
            </div>
          </div>

          <div className='skeleton max-lg:w-full w-[600px] h-[500px] flex-shrink-0' />
        </div>
      </section>

      {/* Mission + Why open source sections */}
      {[0, 1].map((i) => (
        <section key={i} className={`mt-[6rem] max-w-7xl mx-auto px-6 ${i === 1 ? "mt-28" : ""}`}>
          <div className='skeleton h-8 w-72 mx-auto mb-4' />
          <div className='skeleton h-4 w-full max-w-4xl mx-auto mb-2' />
          <div className='skeleton h-4 w-[60%] max-w-4xl mx-auto' />

          <div className='mt-16 grid md:grid-cols-3 gap-12'>
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className='flex flex-col items-center'>
                <div className='skeleton h-5 w-32 mb-4' />
                <div className='skeleton h-4 w-full mb-2' />
                <div className='skeleton h-4 w-[80%]' />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Contributions CTA section */}
      <section className='mt-[6rem] max-w-7xl mx-auto px-6 mb-24'>
        <div className='skeleton h-8 w-72 mx-auto mb-4' />
        <div className='skeleton h-4 w-full max-w-4xl mx-auto mb-2' />
        <div className='skeleton h-4 w-[60%] max-w-4xl mx-auto mb-10' />
        <div className='flex justify-center'>
          <div className='skeleton h-11 w-48 rounded-full' />
        </div>
      </section>
    </>
  );
}
