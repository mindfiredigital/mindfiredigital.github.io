"use client";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import github from "../../../../public/images/social-media/github.png";
import docs from "../../../../public/images/social-media/docs.svg";
import Image from "next/image";
import { AiFillStar } from "react-icons/ai";
import { ProjectProps } from "@/types";

export default function ProjectCard({
  title,
  shortDescription,
  githubUrl,
  documentationUrl,
  parentTitle,
  stars,
  tags,
}: ProjectProps) {
  const [expandDescription, setExpandDescription] = useState(false);

  return (
    <div
      className={`border-2 p-6 transition-[box-shadow] shadow-none hover:shadow-xl bg-slate-50/70 max-w-full flex flex-col relative ${
        parentTitle === "Upcoming Projects" ? "h-52" : "h-80"
      }`}
    >
      <div className='flex-1 flex flex-col overflow-hidden'>
        <div className='flex justify-between items-start mb-2 h-[60px]'>
          <h3 className='font-bold text-lg tracking-widest text-mindfire-text-black line-clamp-2 capitalize pr-2 overflow-hidden'>
            {title}
          </h3>

          {stars !== undefined && (
            <div className='flex items-center gap-1 bg-gray-100 rounded-full p-1 flex-shrink-0'>
              <AiFillStar className='text-yellow-400' />
              <span className='text-sm text-gray-600'>{stars}</span>
            </div>
          )}
        </div>

        {/* Description - fixed height with toggleable expansion */}
        <div
          className={`relative cursor-pointer transition-all duration-300 ${
            expandDescription
              ? "max-h-[90px] overflow-y-auto"
              : "max-h-[5.5rem] overflow-hidden"
          } ${parentTitle === "Upcoming Projects" ? "mb-2" : "mb-4"}`}
          onClick={() => {
            if (shortDescription.length > 120)
              setExpandDescription(!expandDescription);
          }}
        >
          <p
            className={`text-mf-dark tracking-wide leading-6 ${
              expandDescription ? "" : "line-clamp-3"
            }`}
          >
            {shortDescription}
          </p>
        </div>

        {/* Show toggle outside the description div - now clickable */}
        {shortDescription.length > 120 && (
          <span
            className='text-xs text-mindfire-text-red block -mt-2 mb-2 cursor-pointer'
            onClick={() => setExpandDescription(!expandDescription)}
          >
            {expandDescription ? "less" : "more"}
          </span>
        )}

        {/* Tags section - fixed height + horizontal scroll if overflow */}
        {parentTitle !== "Upcoming Projects" && tags && tags.length > 0 && (
          <div className='h-[2.5rem]'>
            <div className='flex gap-2 max-w-full overflow-x-auto pb-1'>
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
