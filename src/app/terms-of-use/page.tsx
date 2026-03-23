import { termsData, TERMS_INTRO_PARAGRAPHS } from "@/constants";
import React from "react";

/* Terms of Use page */
export default function TermOfUsePage() {
  return (
    <div className='max-w-4xl mx-auto my-10 px-6'>
      {/* mindfire-content-p-text-color → mf-light-grey */}
      <div className='tracking-wider flex flex-col gap-4 text-mf-light-grey'>
        {TERMS_INTRO_PARAGRAPHS.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>

      <div className='flex flex-col gap-10 my-10'>
        {termsData.map(({ title, description }, index) => {
          return (
            <div key={index}>
              <h3 className='mb-2 text-mf-light-grey font-semibold text-lg tracking-wider'>
                {title}
              </h3>
              <p className='tracking-wider text-mf-light-grey'>{description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
