import Image from "next/image";
import Link from "next/link";

import { FOOTER } from "@/constants";

const Footer = () => {
  return (
    /* Main footer container */
    <footer className='flex flex-col-reverse lg:flex-row gap-4 lg:justify-between items-center px-6 py-5 text-sm'>
      {/* Copyright + brand */}
      <div className='tracking-wider'>
        <span>&copy; {new Date().getFullYear()} </span>
        <Link href='https://www.mindfiredigitalllp.com/' target='_blank'>
          <span className='text-mf-red hover:underline'>{FOOTER.heading}</span>
        </Link>
        <span>{FOOTER.subheading}</span>
      </div>
      {/* Policy links */}
      <div className='flex flex-col md:flex-row md:items-center md:gap-10'>
        <Link href='/privacy-policy'>{FOOTER.privacyPolicy}</Link>
        <Link href='/cookie-policy'>{FOOTER.cookiePolicy}</Link>
        <Link href='/terms-of-use'>{FOOTER.termsOfUse}</Link>
      </div>
      {/* Divider for mobile */}
      <div className='h-[0.2px] bg-mf-light-grey w-full my-4 lg:hidden'></div>
      {/* Social media icons */}
      <div className='flex flex-wrap gap-4'>
        <Link href='https://www.facebook.com/MindfireSolutions' target='_blank'>
          <Image
            src='/images/social-media/facebook.png'
            height={24}
            width={24}
            alt='facebook_img'
          />
        </Link>

        <Link
          href='https://www.instagram.com/mindfiresolutions/'
          target='_blank'
        >
          <Image
            src='/images/social-media/instagram.png'
            height={24}
            width={24}
            alt='instagram_img'
          />
        </Link>

        <Link href='https://twitter.com/mindfires' target='_blank'>
          <Image
            src='/images/social-media/twitter.png'
            height={24}
            width={24}
            alt='twitter_img'
          />
        </Link>

        <Link
          href='https://www.linkedin.com/company/mindfire-solutions/'
          target='_blank'
        >
          <Image
            src='/images/social-media/linkedin.png'
            height={24}
            width={24}
            alt='linkedIn_img'
          />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
