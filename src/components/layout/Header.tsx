"use client";

import React from "react";
import { Disclosure } from "@headlessui/react";
import { navigations } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import mindfireFossLogo from "../../../public/images/mindfire_foss_logo.png";
import ExternalRedirectIcon from "../shared/icons/ExternalRedirectIcon";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/app/utils";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleProjectScroll = (sectionId: string) => {
    // If we're already on the projects page, just scroll
    if (pathname === "/projects") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Navigate to projects page with the hash
      router.push(`/projects#${sectionId}`);
    }
  };

  return (
    <Disclosure as='header' className='bg-white sticky top-0 z-50'>
      {({ open }) => (
        <>
          <div className='px-6 py-2 flex justify-between items-center'>
            <Link href='/'>
              <Image src={mindfireFossLogo} width={140} alt='logo' />
            </Link>

            <Disclosure.Button className='md:hidden focus:outline-none'>
              <span className='sr-only'>Open main menu</span>
              <div className='flex flex-col gap-1'>
                <span
                  className={cn(
                    "w-6 h-0.5 bg-black transition-transform",
                    open && "rotate-45 translate-y-1.5"
                  )}
                />
                <span
                  className={cn(
                    "w-6 h-0.5 bg-black transition-opacity",
                    open && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "w-6 h-0.5 bg-black transition-transform",
                    open && "-rotate-45 -translate-y-1.5"
                  )}
                />
              </div>
            </Disclosure.Button>

            <div className='hidden md:flex items-center gap-20'>
              <ul className='flex gap-9'>
                {navigations.map((navigation, index) => (
                  <li key={index} className='group'>
                    {navigation.name === "Projects" ? (
                      <div className='relative header-projects'>
                        <Link
                          href={navigation.path[0]}
                          type='button'
                          className={cn("group-hover:text-mf-red", {
                            "text-mf-red": navigation.path.includes(pathname),
                          })}
                          id='menu-button'
                          aria-expanded='true'
                          aria-haspopup='true'
                        >
                          <span>Projects</span>
                        </Link>
                        <div
                          className='projects-dropdown transition-all invisible absolute py-2 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
                          role='menu'
                          aria-orientation='vertical'
                          aria-labelledby='menu-button'
                        >
                          <button
                            onClick={() =>
                              handleProjectScroll("current-projects")
                            }
                            className='block w-full text-left px-4 py-2 hover:bg-mindfire-text-red hover:text-white'
                          >
                            Current Projects
                          </button>
                          <button
                            onClick={() =>
                              handleProjectScroll("upcoming-projects")
                            }
                            className='block w-full text-left px-4 py-2 hover:bg-mindfire-text-red hover:text-white'
                          >
                            Upcoming Projects
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={navigation.path[0]}
                        className={cn(
                          "group-hover:text-mf-red flex items-center gap-1",
                          {
                            "text-mf-red": navigation.path.includes(pathname),
                          }
                        )}
                        {...(navigation.target
                          ? { target: navigation.target }
                          : {})}
                      >
                        <span>{navigation.name}</span>
                        {navigation.icon && navigation.iconAlt && (
                          <ExternalRedirectIcon
                            height='1.2em'
                            width='1.2em'
                            className='group-hover:stroke-mf-red inline-block'
                          />
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href='/join-us'
                className='text-white bg-mf-red font-medium text-base rounded-full px-5 py-2 text-center tracking-wide'
              >
                Join Us!
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className='md:hidden px-6 pb-6'>
            <ul className='flex flex-col gap-5'>
              {navigations.map((navigation, index) => (
                <li key={index}>
                  {navigation.name === "Projects" ? (
                    <div>
                      <Link
                        href={navigation.path[0]}
                        className='text-mf-red font-semibold'
                      >
                        Projects
                      </Link>
                      <ul className='ml-4 mt-2 flex flex-col gap-2'>
                        <li>
                          <button
                            onClick={() =>
                              handleProjectScroll("current-projects")
                            }
                            className='text-gray-700 hover:text-mf-red text-left'
                          >
                            Current Projects
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() =>
                              handleProjectScroll("upcoming-projects")
                            }
                            className='text-gray-700 hover:text-mf-red text-left'
                          >
                            Upcoming Projects
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <Link
                      href={navigation.path[0]}
                      className={cn("flex items-center gap-1", {
                        "text-mf-red": navigation.path.includes(pathname),
                      })}
                      {...(navigation.target
                        ? { target: navigation.target }
                        : {})}
                    >
                      <span>{navigation.name}</span>
                      {navigation.icon && navigation.iconAlt && (
                        <ExternalRedirectIcon
                          height='1.2em'
                          width='1.2em'
                          className='inline-block'
                        />
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <Link
              href='/join-us'
              className='mt-6 inline-block text-white bg-mf-red font-medium text-base rounded-full px-5 py-2 text-center tracking-wide'
            >
              Join Us!
            </Link>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
