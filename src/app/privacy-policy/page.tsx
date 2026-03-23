import Link from "next/link";
import React from "react";
import { privacyPolicyContentData, PRIVACY_POLICY_INTRO } from "@/constants";

/* Privacy Policy page */
const PrivacyPolicy = () => {
  return (
    <div className='max-w-4xl mx-auto my-10 px-6'>
      {/* mindfire-content-p-text-color → mf-light-grey */}
      <p className='tracking-wider text-mf-light-grey'>
        {PRIVACY_POLICY_INTRO.text}{" "}
        <Link
          href={PRIVACY_POLICY_INTRO.linkHref}
          className='text-mf-red hover:text-blue-400'
        >
          {PRIVACY_POLICY_INTRO.linkLabel}
        </Link>{" "}
        {PRIVACY_POLICY_INTRO.suffix}
      </p>

      {privacyPolicyContentData.map(({ title, description }, index) => {
        return (
          <div key={index}>
            <h3 className='mt-10 mb-2 text-mf-light-grey font-semibold text-lg tracking-wider'>
              {title}
            </h3>
            <p className='tracking-wider text-mf-light-grey'>{description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PrivacyPolicy;
