import { cookieData, COOKIE_POLICY_INTRO } from "@/constants";
import React from "react";

export default function CookiePolicyPage() {
  return (
    <div className='max-w-4xl mx-auto my-10 px-6'>
      {/* Introductory paragraph explaining what cookies are and how we use them */}
      <p className='tracking-wider text-mindfire-content-p-text-color'>
        {COOKIE_POLICY_INTRO}
      </p>

      {/*
       * Cookie sections
       * Each item from cookieData renders as a titled section
       * with a short description of that cookie category.
       */}
      <div className='flex flex-col gap-10 my-10'>
        {cookieData.map(({ title, description }, index) => {
          return (
            <div key={index}>
              <h3 className='mb-2 text-mindfire-content-p-text-color font-semibold text-lg tracking-wider'>
                {title}
              </h3>
              <p className='tracking-wider text-mindfire-content-p-text-color'>
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
