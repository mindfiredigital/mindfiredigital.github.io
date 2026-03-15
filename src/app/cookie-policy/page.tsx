import { cookieData } from "@/constants";
import { COOKIE_POLICY_INTRO } from "@/constants";
import React from "react";

export default function CookiePolicyPage() {
  return (
    <div className='max-w-4xl mx-auto my-10 px-6'>
      <p className='tracking-wider text-mindfire-content-p-text-color'>
        {COOKIE_POLICY_INTRO}
      </p>
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
