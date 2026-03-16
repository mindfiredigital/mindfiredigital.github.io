"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { MonorepoPackagesModalProps } from "@/types";
import { PACKAGE_CARD_LABELS, GITHUB_BASE_URL } from "@/constants";
import { getFrameworkName } from "../../utils";

import npm from "../../../../public/images/social-media/npm-svgrepo-com.svg";
import pypi from "../../../../public/images/social-media/pypi-svg.svg";
import filter from "../../../../public/images/social-media/bx-filter-alt.svg";
import download from "../../../../public/images/bxs-download.svg";
import github from "../../../../public/images/bxl-github.svg";

/**
 * MonorepoPackagesModal
 *
 * Displays a modal containing all packages that belong to a monorepo/project group.
 * Users can:
 * - View package download counts
 * - Navigate to the package registry (npm / PyPI)
 * - Open the GitHub repository
 * - Apply a filter to view stats for a specific package
 */
export default function MonorepoPackagesModal({
  isOpen,
  onClose,
  selectedGroup,
  onPackageFilterClick,
}: MonorepoPackagesModalProps) {
  return (
    /**
     * Transition wrapper from Headless UI.
     * Handles modal appearance animations when opening/closing.
     */
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
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
              <Dialog.Panel className='w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
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
                {selectedGroup && (
                  <>
                    <Dialog.Title
                      as='h1'
                      className='text-2xl font-bold text-gray-900 text-center mb-6'
                    >
                      {selectedGroup.baseTitle}
                    </Dialog.Title>
                    <h2 className='text-lg font-semibold mb-4 text-gray-800'>
                      {PACKAGE_CARD_LABELS.availablePackages}
                    </h2>
                    <div className='space-y-3 max-h-96 overflow-y-auto'>
                      {selectedGroup.packages.map((pkg) => (
                        /**
                         * Individual package card displaying package details
                         */
                        <div
                          key={pkg.name}
                          className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-2'>
                                <span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold'>
                                  {getFrameworkName(pkg.title)}
                                </span>
                                <h3 className='font-semibold text-gray-900'>
                                  {pkg.title}
                                </h3>
                              </div>
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <Image
                                  src={download}
                                  height={16}
                                  width={16}
                                  alt='downloads'
                                  loading='lazy'
                                  quality={75}
                                />
                                <span className='font-semibold'>
                                  {new Intl.NumberFormat("en-US").format(
                                    pkg.total || 0
                                  )}
                                </span>
                                <span>
                                  {PACKAGE_CARD_LABELS.downloadsLabel}
                                </span>
                              </div>
                            </div>
                            <div className='flex items-center gap-3'>
                              {/* Filter package stats */}
                              <button
                                className='font-bold px-2 py-1 rounded inline-flex items-center hover:bg-gray-200 transition-colors'
                                onClick={() => onPackageFilterClick(pkg)}
                                title={PACKAGE_CARD_LABELS.filterTitle}
                              >
                                <Image
                                  src={filter}
                                  height={20}
                                  width={20}
                                  alt='filter'
                                  loading='lazy'
                                  quality={75}
                                />
                              </button>

                              {/* Package registry link (npm or PyPI) */}
                              {pkg.url && (
                                <Link
                                  href={pkg.url}
                                  target='_blank'
                                  title={PACKAGE_CARD_LABELS.viewPackageTitle}
                                  className='hover:opacity-75 transition-opacity'
                                >
                                  <Image
                                    src={pkg.type === "pypi" ? pypi : npm}
                                    height={35}
                                    width={35}
                                    alt='package'
                                    loading='lazy'
                                    quality={75}
                                  />
                                </Link>
                              )}

                              {/* GitHub repository link */}
                              <Link
                                href={`${GITHUB_BASE_URL}/${selectedGroup.githubRepo}`}
                                target='_blank'
                                title={PACKAGE_CARD_LABELS.githubTitle}
                                className='hover:opacity-75 transition-opacity'
                              >
                                <Image
                                  src={github}
                                  height={30}
                                  width={30}
                                  alt='github'
                                  loading='lazy'
                                  quality={75}
                                />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
