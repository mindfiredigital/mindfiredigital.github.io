"use client";

import React from "react";
import statsList from "../projects/assets/stats.json";
import Link from "next/link";
import npm from "../../../public/images/social-media/npm-svgrepo-com.svg";
import expand from "../../../public/images/social-media/expand-wide-svgrepo-com.svg";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import moment from "moment";

// type stats = {
//   downloads: download[];
// };

// type download = {
//   downloads: number;
//   day: string;
// };

const Stats = () => {
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [npmPackage, setNpmPackage] = useState({
    name: "fmdapi-node-weaver",
    day: 0,
    week: 3,
    year: 70,
    total: 70,
  });

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // Function to fetch download statistics for a given package and period
  // async function fetchDownloadStats(packageName: string, period: string) {
  //   const url = `https://api.npmjs.org/downloads/range/${period}/@mindfiredigital/${packageName}`;
  //   const response = await fetch(url);

  //   if (!response.ok) {
  //     console.log(
  //       `Failed to fetch download stats for ${packageName} (${period}): ${response.statusText}`
  //     );
  //   }

  //   const data = await response.json();
  //   return data;
  // }

  // // Function to calculate average downloads from the statistics
  // function calculateAverageDownloads(stats: stats) {
  //   return stats.downloads.reduce(
  //     (accumulator, download) => accumulator + download.downloads,
  //     0
  //   );
  // }

  // // Function to fetch and process statistics for a package and period
  // async function getStats(packageName: string, period: string) {
  //   try {
  //     // Fetch download statistics
  //     const stats = await fetchDownloadStats(packageName, period);

  //     // Check if stats exist
  //     if (!stats || !stats.package) return 0;

  //     // Calculate average downloads
  //     const count = calculateAverageDownloads(stats);
  //     console.log(count);
  //   } catch (error) {
  //     // Log and handle errors
  //     console.error(`${packageName} not present`);
  //     return null;
  //   }
  // }
  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>,
    _package: {
      name: string;
      day: number;
      week: number;
      year: number;
      total: number;
    }
  ) {
    console.log(event.target.value);
    console.log(_package);

    // const range = getDateRange(event.target.value as string);
    // getStats(_package.name, `${range?.start}:${range?.end}`);
  }

  // function formatDate(date: Date) {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // }

  // function getDateRange(range: string) {
  //   const currentDate = new Date();
  //   const currentYear = currentDate.getFullYear();
  //   const currentMonth = currentDate.getMonth();
  //   const currentDay = currentDate.getDate();

  //   switch (range.toLowerCase()) {
  //     case "today":
  //       return {
  //         start: formatDate(new Date(currentYear, currentMonth, currentDay)),
  //         end: formatDate(new Date(currentYear, currentMonth, currentDay)),
  //       };
  //     case "yesterday":
  //       const yesterdayDate = new Date(
  //         currentYear,
  //         currentMonth,
  //         currentDay - 1
  //       );
  //       return {
  //         start: formatDate(yesterdayDate),
  //         end: formatDate(yesterdayDate),
  //       };
  //     case "last month":
  //       const lastMonthStartDate = new Date(currentYear, currentMonth - 1, 1);
  //       const lastMonthEndDate = new Date(currentYear, currentMonth, 0);
  //       return {
  //         start: formatDate(lastMonthStartDate),
  //         end: formatDate(lastMonthEndDate),
  //       };
  //     case "last quarter":
  //       const quarterStartMonth = Math.floor(currentMonth / 3) * 3; // Get the start month of the current quarter
  //       const lastQuarterStartDate = new Date(
  //         currentYear,
  //         quarterStartMonth - 3,
  //         1
  //       );
  //       const lastQuarterEndDate = new Date(currentYear, quarterStartMonth, 0);
  //       return {
  //         start: formatDate(lastQuarterStartDate),
  //         end: formatDate(lastQuarterEndDate),
  //       };
  //     case "this year":
  //       const thisYearStartDate = new Date(currentYear, 0, 1);
  //       return {
  //         start: formatDate(thisYearStartDate),
  //         end: formatDate(currentDate),
  //       };
  //     case "this month":
  //       const thisMonthStartDate = new Date(currentYear, currentMonth, 1);
  //       return {
  //         start: formatDate(thisMonthStartDate),
  //         end: formatDate(currentDate),
  //       };
  //     default:
  //       return null;
  //   }
  // }

  const generateChart = async () => {
    // const stats = await fetchDownloadStats();
    // setCount(calculateAverageDownloads(stats));
    setCount(0);
  };

  return (
    <div className='container mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Download Statistics</h1>
      <div className='grid grid-cols-3 gap-4'>
        {statsList.map((stats) => (
          <div
            key={stats.name}
            className='border p-4 rounded bg-white flex flex-col justify-stretch drop-shadow-md hover:scale-105'
          >
            <div className='flex flex-row items-start justify-between'>
              <div>
                <h3 className='font-semibold mb-2 capitalize indent-8 text-mindfire-text-red'>
                  {stats.name.replaceAll("-", " ")}
                </h3>
              </div>
              <div className='flex flex-row items-center'>
                <div>
                  <Link
                    href={`https://www.npmjs.com/package/@mindfiredigital/${stats.name}`}
                    target='_blank'
                  >
                    <Image
                      src={npm}
                      height={20}
                      width={20}
                      alt='npm_img'
                      loading='lazy'
                      quality={75}
                    />
                  </Link>
                </div>
                <div>
                  <button
                    className='font-bold py-2 px-4 rounded inline-flex items-center'
                    onClick={() => {
                      openModal();
                      setNpmPackage(stats);
                    }}
                  >
                    <Image
                      src={expand}
                      height={20}
                      width={20}
                      alt='expand_img'
                      loading='lazy'
                      quality={75}
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-center'>
              <form className='max-w-sm mx-auto'>
                <label
                  htmlFor='range'
                  className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                >
                  Select an option
                </label>
                <select
                  id='range'
                  className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                  onChange={(e) => {
                    handleChange(e, stats);
                  }}
                >
                  <option selected>Range</option>
                  <option value='Today'>Today</option>
                  <option value='Yesterday'>Yesterday</option>
                  <option value='Last month'>Last month</option>
                  <option value='last quarter'>last quarter</option>
                  <option value='this year'>this year </option>
                  <option value='total'>Total Year</option>
                  <option value='this month'>this month</option>
                </select>
              </form>
              <h5 className='text-mindfire-text-black'>Downloads</h5>
              <div className='flex justify-around w-full'>
                <div className='flex flex-col items-center'>
                  <div>
                    <h6 className='text-mindfire-text-black'>{stats.total}</h6>
                  </div>
                  <div>
                    <p className='text-slate-500 uppercase text-xs'>Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h1'
                    className='text-lg font-large leading-6 text-gray-900 capitalize text-center mb-4'
                  >
                    {npmPackage.name.replaceAll("-", " ")}
                  </Dialog.Title>
                  <div
                    key={npmPackage.name}
                    className='border p-4 rounded bg-white flex flex-col justify-stretch drop-shadow-md'
                  >
                    <div className='flex flex-col items-center'>
                      <h5 className='text-mindfire-text-black'>Downloads</h5>
                      <div className='flex flex-row justify-around w-full'>
                        <div className='flex flex-col items-center'>
                          <div>
                            <h6 className='text-mindfire-text-black'>
                              {npmPackage.day}
                            </h6>
                          </div>
                          <div>
                            <p className='text-slate-500 uppercase text-xs'>
                              Daily
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-center'>
                          <div>
                            <h6 className='text-mindfire-text-black'>
                              {npmPackage.week}
                            </h6>
                          </div>
                          <div>
                            <p className='text-slate-500 uppercase text-xs'>
                              Weekly
                            </p>
                          </div>
                        </div>
                        <div className='flex flex-col items-center'>
                          <div>
                            <h6 className='text-mindfire-text-black'>
                              {npmPackage.year}
                            </h6>
                          </div>
                          <div>
                            <p className='text-slate-500 uppercase text-xs'>
                              Yearly
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='container mx-auto p-4 border rounded bg-white drop-shadow-md mt-4'>
                    <h5 className='text-center mb-4'>
                      Daily Downloads Line Chart
                    </h5>
                    <div className='flex space-x-4 mb-4'>
                      <div>
                        <label
                          htmlFor='startDate'
                          className='block font-semibold text-center'
                        >
                          Start Date:
                        </label>
                        <input
                          type='date'
                          id='startDate'
                          className='border border-gray-300 rounded-md px-2 py-1'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor='endDate'
                          className='block font-semibold text-center'
                        >
                          End Date:
                        </label>
                        <input
                          type='date'
                          id='endDate'
                          className='border border-gray-300 rounded-md px-2 py-1'
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className='flex flex-col items-center'>
                      <button
                        className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded'
                        onClick={generateChart}
                      >
                        Generate Chart
                      </button>
                      <div className='flex flex-col items-center MT-4'>
                        <div className='flex flex-row justify-around w-full'>
                          <div className='flex flex-col items-center'>
                            <div>
                              <h6 className='text-mindfire-text-black'>
                                {count}
                              </h6>
                            </div>
                            <div>
                              <p className='text-slate-500 uppercase text-xs'>
                                total
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Stats;
