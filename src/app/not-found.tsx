import Link from "next/link";
import { NOT_FOUND } from "@/constants";

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] text-center px-4'>
      <h1 className='text-6xl font-bold text-mf-red'>{NOT_FOUND.fourOfour}</h1>
      <h2 className='text-2xl mt-4 font-semibold'>{NOT_FOUND.pageNotFound}</h2>
      <p className='text-gray-600 mt-2'>{NOT_FOUND.doesntExist}</p>
      <Link
        href='/'
        className='mt-6 px-6 py-3 bg-mf-red text-white rounded-md hover:bg-opacity-90 transition'
      >
        {NOT_FOUND.backHome}
      </Link>
    </div>
  );
}
