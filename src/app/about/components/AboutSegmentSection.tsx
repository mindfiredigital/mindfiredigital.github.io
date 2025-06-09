import { cn } from "@/app/utils";
import React from "react";
import { Aboutprops } from "@/types";

const AboutSegmentSection = ({
  title,
  description,
  data,
  className,
  children,
}: Aboutprops) => {
  return (
    <section className={cn("mt-[6rem] max-w-7xl mx-auto px-6", className)}>
      <h3 className='tracking-wider text-3xl font-medium capitalize text-mindfire-text-black  text-center'>
        {title}
      </h3>
      <p className='mt-4 text-mf-dark tracking-wide leading-8 max-w-4xl text-center mx-auto'>
        {description}
      </p>
      <div className='mt-16 grid md:grid-cols-3 gap-12'>
        {data && data.length > 0
          ? data.map(({ title, description }, index) => {
              return (
                <div key={index}>
                  <h4 className='font-bold text-lg tracking-wider text-mindfire-text-black capitalize text-center'>
                    {title}
                  </h4>
                  <p className='mt-4 text-center leading-8 text-mindfire-content-p-text-color'>
                    {description}
                  </p>
                </div>
              );
            })
          : null}
      </div>
      {children ? <div>{children}</div> : null}
    </section>
  );
};

export default AboutSegmentSection;
