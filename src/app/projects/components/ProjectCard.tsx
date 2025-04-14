"use client";
import Link from "next/link";
import React from "react";
import { useState } from "react";
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
  const [expandDescription, setExpandDescription] = useState(false);

  return (
    <div className='border-2 p-6 transition-[box-shadow] shadow-none hover:shadow-xl bg-slate-50/70 max-w-full h-64 flex flex-col relative'>
      {/* Top content section */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <div className='flex justify-between items-start mb-3'>
          <h3 className='font-bold text-lg tracking-widest text-mindfire-text-black capitalize pr-2'>
            {title}
          </h3>
          {parentTitle !== "Upcoming Projects" && stars !== undefined && (
            <div className='flex items-center gap-1 bg-gray-100 rounded-full p-1 flex-shrink-0'>
              <AiFillStar className='text-yellow-400' />
              <span className='text-sm text-gray-600'>{stars}</span>
            </div>
          )}
        </div>

        {/* Description that expands on click */}
        {shortDescription.length > 120 ? (
          <div
            className={`mb-3 relative cursor-pointer ${
              expandDescription ? "max-h-[72px] overflow-y-auto" : ""
            }`}
            onClick={() => setExpandDescription(!expandDescription)}
          >
            <p
              className={`text-mf-dark tracking-wide leading-6 ${
                expandDescription ? "" : "line-clamp-2"
              }`}
            >
              {shortDescription}
            </p>
            <span className='text-xs text-blue-500 mt-1 block'>
              {expandDescription ? "less" : "more"}
            </span>
          </div>
        ) : (
          <div className='mb-3'>
            <p className='text-mf-dark tracking-wide leading-6'>
              {shortDescription}
            </p>
            <span className='text-xs mt-1 block opacity-0'>less</span>
          </div>
        )}

        {parentTitle !== "Upcoming Projects" && tags && tags.length > 0 && (
          <div className='mt-1'>
            <div className={`flex gap-2 max-w-full overflow-x-auto pb-2' `}>
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-red-500 truncate flex-shrink-0'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer section  */}
      {parentTitle !== "Upcoming Projects" &&
        (githubUrl || documentationUrl) &&
        (githubUrl !== "NA" || documentationUrl !== "NA") && (
          <div className='mt-2'>
            <div className='border-t-2'></div>
            <div className='flex gap-4 justify-center mt-2'>
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
                  <Image
                    src={docs}
                    height={20}
                    width={20}
                    alt='Documentation'
                  />
                  <span className='text-sm text-gray-600'>Docs</span>
                </Link>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
