"use client";

import React, { Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { PackageStatsModalProps } from "@/types";
import {
  PACKAGE_CARD_LABELS,
  NPM_RANGE_OPTIONS,
  PYPI_RANGE_OPTIONS,
  DATE_PICKER_LABELS,
} from "@/constants";

import download from "../../../../public/images/bxs-download.svg";

/**
 * PackageStatsModal
 *
 * Displays detailed download statistics for a selected package.
 * Features:
 * - Download count display
 * - Time range selection (npm / PyPI specific options)
 * - Custom date range selection for npm packages
 * - Loading state indicator
 */
export default function PackageStatsModal({
  isOpen,
  onClose,
  selectedPackage,
  selectedRange,
  loading,
  count,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRangeChange,
}: PackageStatsModalProps) {
  return (
    /**
     * Transition wrapper from Headless UI
     * Controls modal appearance animation
     */
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={onClose}>
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
                    onClick={onClose}
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
                  {selectedPackage?.title}
                </Dialog.Title>
                {/* Main stats container */}
                <div className='border p-4 rounded bg-white flex flex-col justify-stretch'>
                  <div className='mb-4 flex justify-center items-center'>
                    <p className='text-mindfire-text-black text-xm font-bold mr-2'>
                      {PACKAGE_CARD_LABELS.selectLabel}
                    </p>

                    <div className='relative inline-block w-32'>
                      <select
                        id='range'
                        className='bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-1 appearance-none outline-none'
                        onChange={onRangeChange}
                      >
                        {(selectedPackage?.type === "npm"
                          ? NPM_RANGE_OPTIONS
                          : PYPI_RANGE_OPTIONS
                        ).map((opt) => (
                          <option
                            key={opt.value}
                            value={
                              opt.value === "total"
                                ? selectedPackage?.total
                                : opt.value === "month"
                                  ? selectedPackage?.month
                                  : opt.value === "day"
                                    ? selectedPackage?.day
                                    : opt.value === "week"
                                      ? selectedPackage?.week
                                      : opt.value
                            }
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Custom dropdown arrow */}
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
                    {selectedRange && selectedPackage?.type === "npm" && (
                      <div className='container bg-white'>
                        <div className='flex ml-6 mb-4'>
                          <div className='mr-1'>
                            <label
                              htmlFor='startDate'
                              className='block font-semibold text-center'
                            >
                              {DATE_PICKER_LABELS.startDate}
                            </label>
                            <input
                              type='date'
                              id='startDate'
                              className='border border-gray-300 rounded-md px-2 py-1'
                              value={startDate}
                              onChange={(e) =>
                                onStartDateChange(e.target.value)
                              }
                            />
                          </div>

                          <div className='ml-1'>
                            <label
                              htmlFor='endDate'
                              className='block font-semibold text-center'
                            >
                              {DATE_PICKER_LABELS.endDate}
                            </label>
                            <input
                              type='date'
                              id='endDate'
                              className='border border-gray-300 rounded-md px-2 py-1'
                              value={endDate}
                              onChange={(e) => onEndDateChange(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className='flex flex-col items-center mt-4'>
                      <div className='flex justify-around w-full'>
                        <div className='flex flex-col items-center'>
                          <div className='flex flex-row items-center space-x-1'>
                            <Image
                              src={download}
                              height={20}
                              width={20}
                              alt='downloads'
                              loading='lazy'
                              quality={75}
                            />

                            <div>
                              {loading ? (
                                /**
                                 * Loading spinner shown while stats are being fetched
                                 */
                                <div className='flex justify-center items-center w-5 h-5 border border-t-4 border-gray-700 rounded-full animate-spin'>
                                  <svg
                                    className='animate-spin h-5 w-5 mr-3'
                                    viewBox='0 0 24 24'
                                  />
                                </div>
                              ) : (
                                /**
                                 * Formatted download count
                                 */
                                <h6 className='text-mindfire-text-black font-semibold text-xl'>
                                  {new Intl.NumberFormat("en-US").format(count)}
                                </h6>
                              )}
                            </div>
                          </div>

                          <div className='mt-2 ml-2'>
                            <p className='text-mindfire-text-black text-xm'>
                              {PACKAGE_CARD_LABELS.downloadsLabel}
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
  );
}
