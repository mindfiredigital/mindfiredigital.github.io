import Link from "next/link";
import React from "react";
import github from "../../../../public/images/social-media/github.png";
import docs from "../../../../public/images/social-media/docs.svg";
import Image from "next/image";
import { AiFillStar } from "react-icons/ai";

interface Props {
  title: string;
  parentTitle: string;
  shortDescription: string;
  githubUrl?: string;
  documentationUrl?: string;
  stars?: number;
  tags?: string[];
}

export default function ProjectCard({
  title,
  shortDescription,
  githubUrl,
  documentationUrl,
  parentTitle,
  stars,
  tags,
}: Props) {
  return (
    <div className='border-2 p-8 transition-[box-shadow] shadow-none hover:shadow-xl bg-slate-50/70 max-w-full'>
      <div className='flex justify-between items-start'>
        <h3 className='font-bold text-lg tracking-widest text-mindfire-text-black capitalize'>
          {title}
        </h3>
        {parentTitle !== "Upcoming Projects" && stars !== undefined && (
          <div className='flex items-center gap-1 bg-gray-100 rounded-full p-1'>
            <AiFillStar className='text-yellow-400' />
            <span className='text-sm text-gray-600'>{stars}</span>
          </div>
        )}
      </div>
      <p className='mt-3 text-mf-dark tracking-wide leading-6'>
        {shortDescription}
      </p>
      {parentTitle !== "Upcoming Projects" && tags && tags.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-4 max-w-full'>
          {tags.map((tag, index) => (
            <span
              key={index}
              className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-red-500 truncate'
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {parentTitle !== "Upcoming Projects" &&
        (githubUrl || documentationUrl) &&
        (githubUrl !== "NA" || documentationUrl !== "NA") && (
          <div className='flex gap-4 justify-start mt-6 pt-6 border-t-2'>
            {githubUrl && githubUrl !== "NA" && (
              <Link
                href={githubUrl}
                target='_blank'
                className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
              >
                <Image
                  src={github}
                  height={20}
                  width={20}
                  alt='Repository'
                  className='rounded-full'
                />
                <span className='text-sm text-gray-600'>Repository</span>
              </Link>
            )}
            {documentationUrl && documentationUrl !== "NA" && (
              <Link
                href={documentationUrl}
                target='_blank'
                className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
              >
                <Image src={docs} height={20} width={20} alt='Documentation' />
                <span className='text-sm text-gray-600'>Docs</span>
              </Link>
            )}
          </div>
        )}
    </div>
  );
}
