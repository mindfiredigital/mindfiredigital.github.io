import { termsData, TERMS_INTRO_PARAGRAPHS } from "@/constants";
import React from "react";

/* Page component for the Terms of Use route Renders introductory paragraphs and a list of terms sections Content is sourced entirely from @/constants to keep this component pure presentational */
export default function TermOfUsePage() {
  return (
    <div className='max-w-4xl mx-auto my-10 px-6'>
      {/* Introductory paragraphs section */}
      <div className='tracking-wider flex flex-col gap-4 text-mindfire-content-p-text-color'>
        {TERMS_INTRO_PARAGRAPHS.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>

      {/* Terms sections — each item has a title and description */}
      <div className='flex flex-col gap-10 my-10'>
        {termsData.map(({ title, description }, index) => {
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
