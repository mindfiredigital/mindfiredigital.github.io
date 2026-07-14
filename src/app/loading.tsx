/* Skeleton for the home page hero — mirrors src/app/page.tsx layout */
export default function Loading() {
  return (
    <main className='hero-section flex flex-col-reverse items-center lg:flex-row justify-between px-6 pr-12 py-12 min-h-[500px] lg:min-h-[600px]'>
      {/* Left: heading, subheading, CTA button */}
      <div className='max-w-2xl mt-7 w-full'>
        <div className='skeleton h-9 w-[90%] mb-3' />
        <div className='skeleton h-9 w-[60%] mb-6' />

        <div className='skeleton h-4 w-full mb-2' />
        <div className='skeleton h-4 w-[85%] mb-10' />

        <div className='skeleton h-12 w-44 rounded-full' />
      </div>

      {/* Right: hero video placeholder */}
      <div className='skeleton relative flex-shrink-0 w-[410px] h-[410px] max-w-full rounded-full' />
    </main>
  );
}
