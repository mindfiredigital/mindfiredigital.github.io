import Link from "next/link";
import { NOT_FOUND } from "@/constants";

/*
  This component represents a custom 404 (Not Found) page.
  In Next.js (App Router), naming the file as `not-found.js`
  makes it automatically render when a route is not found.
*/
export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
      {/* Large 404 text */}
      <h1 className='text-6xl font-bold text-mf-red'>{NOT_FOUND.fourOfour}</h1>
      {/* Subtitle: "Page Not Found" */}
      <h2 className='text-2xl mt-4 font-semibold'>{NOT_FOUND.pageNotFound}</h2>
      {/* Description message */}
      <p className='text-gray-600 mt-2'>{NOT_FOUND.doesntExist}</p>
      {/* Link to navigate back to homepage */}
      <Link
        href='/'
        className='mt-6 px-6 py-3 bg-mf-red text-white rounded-md hover:bg-opacity-90 transition'
      >
        {NOT_FOUND.backHome}
      </Link>
    </div>
  );
}
