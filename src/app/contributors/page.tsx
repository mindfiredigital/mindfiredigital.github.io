"use client";

import Link from "next/link";
import React from "react";
import github from "../../../public/images/social-media/github.png";
import Image from "next/image";
import contributorList from "../projects/assets/contributors.json";

const Contributors = () => {
  const contributorsArray = Object.values(contributorList);
  return (
    <>
      <section className='bg-slate-50'>
        <div className='container mx-auto text-center'>
          <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black mt-10'>
            Our Contributors
          </h1>
          <p className='mt-6 text-xl text-mf-light-grey tracking-wide mb-10'>
            We’re a dynamic group of individuals who are passionate about what
            we do.
          </p>
          {contributorsArray ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {contributorsArray.map((contributor) => (
                <div
                  key={contributor.id}
                  className='bg-white border border-gray-200 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105'
                >
                  <div className='p-4'>
                    <img
                      className='w-24 h-24 mb-3 rounded-full shadow-lg mx-auto transition-transform duration-300 transform hover:scale-105'
                      src={contributor.avatar_url}
                      alt={`Contributor ${contributor.login}`}
                    />
                    <div className='flex justify-center items-center gap-2 mt-4 '>
                      <Link href={contributor.html_url!} target='_blank'>
                        <Image
                          src={github}
                          height={20}
                          width={20}
                          alt='github_img'
                        />
                      </Link>
                      <h5 className='text-xl font-medium text-gray-900 text-center'>
                        {contributor.login}
                      </h5>
                    </div>
                    <p className='text-sm text-gray-500 text-center'>
                      Contributions: {contributor.contributions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <p className='mt-6 text-xl text-mf-light-grey tracking-wide mb-10'>
                No records found!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Contributors;
