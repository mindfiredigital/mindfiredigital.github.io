import Link from "next/link";
import React from "react";
import github from "../../../public/images/social-media/github.png";
import contributorImg from "../../../public/images/social-media/contributor.svg";
import prImg from "../../../public/images/social-media/pull-request.svg";
import issueImg from "../../../public/images/social-media/git-issue.svg";
import Image from "next/image";
import contributorList from "../projects/assets/contributors.json";
import ContributorCount from "./components/ContributorCount";
import TopContributors from "./components/TopContributors";
import { Contributor } from "@/types";

const Contributors = () => {
  const contributorsArray = Object.values(contributorList) as Contributor[];

  // Filter and sort contributors for top section (active in last 30 days)
  const activeTopContributors = [...contributorsArray]
    .filter(
      (contributor) =>
        contributor.lastActiveDays !== null && contributor.lastActiveDays <= 30
    )
    .sort((a, b) => b.contributions - a.contributions);

  // Sort all contributors by contributions for the main grid
  const sortedAllContributors = [...contributorsArray].sort(
    (a, b) => b.contributions - a.contributions
  );

  return (
    <>
      <section className='bg-slate-50'>
        <div className='container mx-auto text-center'>
          <div className='flex items-center justify-center gap-4 mt-10'>
            <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              Our Contributors
            </h1>
            <ContributorCount totalContributors={contributorsArray.length} />
          </div>

          {/* Top Contributors Section */}
          <div className='mt-12 flex flex-col items-center justify-center'>
            <h2 className='text-2xl font-medium text-gray-800 mb-6'>
              Top Active Contributors
            </h2>
            <p className='text-xl text-mf-light-grey tracking-wide mb-2 flex flex-wrap'>
              Meet our top six contributors — the people who help turn ideas
              into impact.
            </p>
            <TopContributors contributors={activeTopContributors} />
          </div>

          {/* All Contributors Section */}
          <div className='mt-6 flex flex-col items-center justify-center'>
            <h2 className='text-2xl font-medium text-gray-800 mb-6'>
              All Contributors
            </h2>
            <p className='text-xl text-mf-light-grey tracking-wide mb-10'>
              We&apos;re a dynamic group of individuals who are passionate about
              what we do.
            </p>
            {contributorsArray ? (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6'>
                {sortedAllContributors.map((contributor) => (
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
                            loading='lazy'
                            quality={75}
                          />
                        </Link>
                        <Link href={contributor.html_url!} target='_blank'>
                          <h5 className='text-xl font-medium text-gray-900 text-center'>
                            {contributor.login}
                          </h5>
                        </Link>
                      </div>
                      <footer>
                        <div className='grid grid-cols-3 divide-x'>
                          <div className='flex justify-center items-center gap-1 mt-4 '>
                            <div>
                              <Image
                                src={contributorImg}
                                height={20}
                                width={20}
                                alt='contributor'
                                loading='lazy'
                                quality={75}
                                title='Contributions'
                              />
                            </div>
                            <p className='text-sm text-gray-500 text-center'>
                              {contributor.contributions}
                            </p>
                          </div>
                          <div className='flex justify-center items-center gap-1 mt-4 '>
                            <div>
                              <Image
                                src={prImg}
                                height={20}
                                width={20}
                                alt='pull request'
                                loading='lazy'
                                quality={75}
                                title='Pull Requests'
                              />
                            </div>
                            <p className='text-sm text-gray-500 text-center'>
                              {contributor.pullRequestCount}
                            </p>
                          </div>
                          <div className='flex justify-center items-center gap-1 mt-4 '>
                            <div>
                              <Image
                                src={issueImg}
                                height={20}
                                width={20}
                                alt='issue'
                                loading='lazy'
                                quality={75}
                                title='Issues'
                              />
                            </div>
                            <p className='text-sm text-gray-500 text-center'>
                              {contributor.issueCount}
                            </p>
                          </div>
                        </div>
                      </footer>
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
        </div>
      </section>
    </>
  );
};

export default Contributors;
