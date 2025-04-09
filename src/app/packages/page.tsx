"use client";

import React, { useEffect, useState, Fragment } from "react";
import statsList from "../projects/assets/stats.json";
import Link from "next/link";
import npm from "../../../public/images/social-media/npm-svgrepo-com.svg";
import pypi from "../../../public/images/social-media/pypi-svg.svg";
import filter from "../../../public/images/social-media/bx-filter-alt.svg";
import download from "../../../public/images/bxs-download.svg";
import github from "../../../public/images/bxl-github.svg";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import moment from "moment";
import PackageCount from "./components/PackageCount";

type Package = {
  name: string;
  type: "npm" | "pypi";
  day?: number;
  week?: number;
  year?: number;
  total?: number;
  last_day?: number;
  last_week?: number;
  last_month?: number;
};

type NpmStats = {
  downloads: { downloads: number; day: string }[];
};

const Stats = () => {
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [selectedRange, setSelectedRange] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package>({
    name: "fmdapi-node-weaver",
    type: "npm",
    day: 0,
    week: 3,
    year: 70,
    total: 70,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [packages, setPackages] = useState<Package[]>(statsList as Package[]);

  function closeModal() {
    setIsOpen(false);
    setSelectedRange(false);
  }

  useEffect(() => {
    if (selectedPackage) {
      setCount(selectedPackage.total || 0); //update total count when npmPackage is updated
    }
  }, [selectedPackage]);

  function openModal() {
    setIsOpen(true);
    setCount(selectedPackage.total || 0);
  }

  async function fetchNpmStats(
    packageName: string,
    period: string
  ): Promise<NpmStats> {
    setLoading(true);
    const url = `https://api.npmjs.org/downloads/range/${period}/@mindfiredigital/${packageName}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.log(
        `Failed to fetch download stats for ${packageName} (${period}): ${response.statusText}`
      );
      setLoading(false);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setLoading(false);
    return data;
  }

  function calculateDownloads(stats: NpmStats): number {
    if (!stats || !stats.downloads) {
      return 0;
    }
    return stats.downloads.reduce(
      (acc, download) => acc + download.downloads,
      0
    );
  }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (!selectedPackage) return;

    const range = getDateRange(event.target.value);

    if (selectedPackage.type === "npm") {
      fetchNpmStats(selectedPackage.name, `${range.start}:${range.end}`).then(
        (res) => {
          setLoading(true);
          const count = calculateDownloads(res);
          setCount(count);
          setLoading(false);
        }
      );
    } else if (selectedPackage.type === "pypi") {
      setCount(Number(event.target.value) || 0);
    }
  }

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  function getDateRange(range: string) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    switch (range.toLowerCase()) {
      case "today":
        setSelectedRange(false);
        return {
          start: formatDate(new Date(currentYear, currentMonth, currentDay)),
          end: formatDate(new Date(currentYear, currentMonth, currentDay)),
        };
      case "yesterday": {
        setSelectedRange(false);
        const yesterdayDate = new Date(
          currentYear,
          currentMonth,
          currentDay - 1
        );
        return {
          start: formatDate(yesterdayDate),
          end: formatDate(yesterdayDate),
        };
      }
      case "last month": {
        setSelectedRange(false);
        const lastMonthStartDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEndDate = new Date(currentYear, currentMonth, 0);
        return {
          start: formatDate(lastMonthStartDate),
          end: formatDate(lastMonthEndDate),
        };
      }
      case "this month": {
        setSelectedRange(false);
        const thisMonthStartDate = new Date(currentYear, currentMonth, 1);
        return {
          start: formatDate(thisMonthStartDate),
          end: formatDate(currentDate),
        };
      }
      case "last quarter": {
        setSelectedRange(false);
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        const lastQuarterStartDate = new Date(
          currentYear,
          quarterStartMonth - 3,
          1
        );
        const lastQuarterEndDate = new Date(currentYear, quarterStartMonth, 0);
        return {
          start: formatDate(lastQuarterStartDate),
          end: formatDate(lastQuarterEndDate),
        };
      }
      case "this year": {
        setSelectedRange(false);
        const thisYearStartDate = new Date(currentYear, 0, 1);
        return {
          start: formatDate(thisYearStartDate),
          end: formatDate(currentDate),
        };
      }
      case "custom": {
        setSelectedRange(true);
        setCount(0);
        return {
          start: formatDate(new Date(currentYear, currentMonth, currentDay)),
          end: formatDate(new Date(currentYear, currentMonth, currentDay)),
        };
      }
      default: {
        setSelectedRange(false);
        return {
          start: "1000-01-01",
          end: "3000-01-01",
        };
      }
    }
  }
  const generateChart = async () => {
    if (selectedPackage.type === "npm") {
      const stats = await fetchNpmStats(
        selectedPackage.name,
        `${startDate}:${endDate}`
      );
      setCount(calculateDownloads(stats));
    }
  };

  useEffect(() => {
    if (selectedRange && selectedPackage.type === "npm") {
      generateChart();
    }
  }, [startDate, endDate, selectedRange, selectedPackage]);

  return (
    <section className='bg-slate-50'>
      <div className='container mx-auto flex flex-col gap-4 items-center'>
        <div className='flex items-center gap-4 mt-10'>
          <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
            Our Packages
          </h1>
          <PackageCount totalPackages={packages.length} />
        </div>
        <p className='mt-6 text-xl text-mf-light-grey tracking-wide mb-10 text-center'>
          Elevate your projects with Mindfire&apos;s game-changing open-source
          packages.
        </p>
        <div className='lg:mx-36 md:mx-24 sm:mx-20 '>
          <div className='flex flex-col gap-4 flex-wrap lg:flex-row'>
            {packages.map((package_item) => (
              <div
                key={package_item.name}
                className='border p-4 rounded bg-white flex flex-col justify-stretch drop-shadow-md w-80 hover:scale-105'
              >
                <div className='flex flex-row items-start justify-between'>
                  <div>
                    <h3 className='font-semibold mb-2 ml-2 text-mindfire-text-black capitalize'>
                      {package_item.name.replaceAll("-", " ")}
                    </h3>
                  </div>
                  <div className='flex flex-row'>
                    <div>
                      <button
                        className='font-bold px-2 py-1 rounded inline-flex items-center'
                        onClick={() => {
                          setSelectedPackage(package_item);
                          openModal();
                        }}
                        title='Filter'
                      >
                        <Image
                          src={filter}
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
                <div className='flex flex-row items-center mt-4'>
                  <div className='flex justify-around w-full'>
                    <div className='flex flex-col mr-auto ml-2'>
                      <div className='flex flex-row items-center space-x-1'>
                        <Image
                          src={download}
                          height={20}
                          width={20}
                          alt='expand_img'
                          loading='lazy'
                          quality={75}
                        />
                        <div>
                          <h6 className='text-mindfire-text-black font-semibold text-xl'>
                            {new Intl.NumberFormat("en-US").format(
                              package_item.total ?? 0
                            )}
                          </h6>
                        </div>
                      </div>
                      <div className='mt-2'>
                        <p className='text-gray-500 text-xm'>Downloads</p>
                      </div>
                    </div>
                  </div>
                  <div className='mt-8 mr-1 flex flex-row items-center space-x-1'>
                    <div>
                      <Link
                        href={
                          package_item.type === "npm"
                            ? `https://www.npmjs.com/package/@mindfiredigital/${package_item.name}`
                            : `https://pypi.org/project/${package_item.name}/`
                        }
                        target='_blank'
                        title='View Package'
                      >
                        <Image
                          src={package_item.type === "pypi" ? pypi : npm}
                          height={35}
                          width={35}
                          alt='package_img'
                          loading='lazy'
                          quality={75}
                        />
                      </Link>
                    </div>
                    <div>
                      <Link
                        href={`https://github.com/mindfiredigital/${package_item.name}`}
                        target='_blank'
                        title='Github'
                      >
                        <Image
                          src={github}
                          height={30}
                          width={30}
                          alt='github_img'
                          loading='lazy'
                          quality={75}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                    <div className='absolute right-2 top-2'>
                      <button
                        onClick={closeModal}
                        className='text-gray-500 hover:text-gray-700 focus:outline-none'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-6 w-6'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='black'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                    <Dialog.Title
                      as='h1'
                      className='text-lg font-large leading-6 text-gray-900 capitalize text-center mb-4 font-extrabold'
                    >
                      {selectedPackage.name.replaceAll("-", " ")}
                    </Dialog.Title>
                    <div className='border p-4 rounded bg-white flex flex-col justify-stretch'>
                      <div className='mb-4 flex justify-center items-center'>
                        <p className='text-mindfire-text-black text-xm font-bold mr-2'>
                          Select
                        </p>
                        <div className='relative inline-block w-32'>
                          {selectedPackage.type === "npm" ? (
                            <select
                              id='range'
                              className='bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-1 appearance-none outline-none'
                              onChange={handleChange}
                            >
                              <option value={selectedPackage.total}>
                                Total
                              </option>
                              <option value='Today'>Today</option>
                              <option value='Yesterday'>Yesterday</option>
                              <option value='Last month'>Last month</option>
                              <option value='this month'>This month</option>
                              <option value='last quarter'>Last quarter</option>
                              <option value='this year'>This year</option>
                              <option value='custom'>Custom Range</option>
                            </select>
                          ) : (
                            <select
                              id='range'
                              className='bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-1 appearance-none outline-none'
                              onChange={handleChange}
                            >
                              <option value={selectedPackage.total}>
                                Total
                              </option>
                              <option value={selectedPackage.last_month}>
                                Last month
                              </option>
                              <option value={selectedPackage.last_day}>
                                Yesterday
                              </option>
                              <option value={selectedPackage.last_week}>
                                Last week
                              </option>
                            </select>
                          )}
                          <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
                            <svg
                              className='w-4 h-4 fill-current text-gray-500'
                              viewBox='0 0 20 20'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M7 7l3-3 3 3m0 6l-3 3-3-3'
                                stroke='currentColor'
                                strokeWidth='1.5'
                                fill='none'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col items-center'>
                        {selectedRange && selectedPackage.type === "npm" ? (
                          <div className='container bg-white'>
                            <div className='flex ml-6 mb-4'>
                              <div className='mr-1'>
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
                              <div className='ml-1'>
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
                          </div>
                        ) : null}
                        <div className='flex flex-col items-center mt-4'>
                          <div className='flex justify-around w-full'>
                            <div className='flex flex-col items-center'>
                              <div className='flex flex-row items-center space-x-1'>
                                <Image
                                  src={download}
                                  height={20}
                                  width={20}
                                  alt='expand_img'
                                  loading='lazy'
                                  quality={75}
                                />
                                <div>
                                  {loading ? (
                                    <div className='flex justify-center items-center w-5 h-5 border border-t-4 border-gray-700 rounded-full animate-spin'>
                                      <svg
                                        className='animate-spin h-5 w-5 mr-3 ...'
                                        viewBox='0 0 24 24'
                                      >
                                        {" "}
                                      </svg>
                                    </div>
                                  ) : (
                                    <h6 className='text-mindfire-text-black font-semibold text-xl'>
                                      {new Intl.NumberFormat("en-US").format(
                                        count
                                      )}
                                    </h6>
                                  )}
                                </div>
                              </div>
                              <div className='mt-2 ml-2'>
                                <p className='text-mindfire-text-black text-xm'>
                                  Downloads
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
    </section>
  );
};

export default Stats;
