import Link from "next/link";
import React from "react";
import { privacyPolicyContentData } from "@/constants";

const PrivacyPolicy = () => {
  return (
    <div className='max-w-4xl mx-auto my-10 px-6'>
      <p className='tracking-wider text-mindfire-content-p-text-color'>
        This Privacy Policy governs the manner in which
        mindfiredigital.github.io collects, uses, maintains and discloses
        information collected from users (each, a “User”) of the{" "}
        <Link
          href='https://mindfiredigital.github.io/'
          className='text-mf-red hover:text-blue-400'
        >
          https://mindfiredigital.github.io/
        </Link>{" "}
        website (“Site”). This privacy policy applies to the Site and all
        products and services offered by Mindfire Digital GitHub.
      </p>

      {privacyPolicyContentData.map(({ title, description }, index) => {
        return (
          <div key={index}>
            <h3 className='mt-10 mb-2 text-mindfire-content-p-text-color font-semibold text-lg tracking-wider'>
              {title}
            </h3>
            <p className='tracking-wider text-mindfire-content-p-text-color'>
              {description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PrivacyPolicy;
