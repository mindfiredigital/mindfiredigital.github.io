"use client";

import React from "react";
import statsList from "../projects/assets/stats.json";
import Link from "next/link";
import npm from "../../../public/images/social-media/npm-svgrepo-com.svg";
import expand from "../../../public/images/social-media/expand-wide-svgrepo-com.svg";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

const Stats = () => {
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
                      openModal(), setNpmPackage(stats);
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
              <h5 className='text-mindfire-text-black'>Downloads</h5>
              <div className='flex justify-around w-full'>
                <div className='flex flex-col items-center'>
                  <div>
                    <h6 className='text-mindfire-text-black'>{stats.day}</h6>
                  </div>
                  <div>
                    <p className='text-slate-500 uppercase text-xs'>Daily</p>
                  </div>
                </div>
                <div className='flex flex-col items-center'>
                  <div>
                    <h6 className='text-mindfire-text-black'>{stats.week}</h6>
                  </div>
                  <div>
                    <p className='text-slate-500 uppercase text-xs'>Weekly</p>
                  </div>
                </div>
                <div className='flex flex-col items-center'>
                  <div>
                    <h6 className='text-mindfire-text-black'>{stats.year}</h6>
                  </div>
                  <div>
                    <p className='text-slate-500 uppercase text-xs'>Yearly</p>
                  </div>
                </div>
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
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    {npmPackage.name.replaceAll("-", " ")}
                  </Dialog.Title>
                  <div key={npmPackage.name}>
                    <div className='flex flex-col items-start'>
                      <h5 className='text-mindfire-text-black'>Downloads</h5>
                      <div className='flex flex-row justify-center'>
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
