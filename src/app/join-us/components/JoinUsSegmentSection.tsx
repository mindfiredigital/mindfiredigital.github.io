import { cn } from "@/app/utils";
import React from "react";
import { Aboutprops } from "@/types";

export default function JoinUsSegmentSection({
  title,
  description,
  data,
  className,
  children,
}: Aboutprops) {
  return (
    <section className={cn("mt-[6rem] max-w-6xl mx-auto px-6", className)}>
      <h3 className='tracking-widest text-3xl font-medium capitalize text-mindfire-text-black text-center'>
        {title}{" "}
        <span className='text-mf-dark font-semibold tracking-widest'>FOSS</span>
      </h3>
      <p className='mt-4 text-mf-dark tracking-wide leading-8 max-w-4xl text-center mx-auto'>
        {description}
      </p>
      <div className='mt-16 grid md:grid-cols-1 gap-11 max-w-3xl'>
        {data && data.length > 0
          ? data.map(({ title, description }, index) => {
              return (
                <div key={index} className='flex gap-4'>
                  <div className='px-4 text-[2.6rem] leading-[3.4rem] text-mf-light-grey font-semibold'>
                    {index + 1}
                  </div>
                  <div className='px-4'>
                    <h4 className='font-bold text-lg tracking-wider text-mindfire-text-black capitalize'>
                      {title}
                    </h4>
                    <p className='mt-4 leading-8 text-mindfire-content-p-text-color tracking-wider'>
                      {description}
                    </p>
                  </div>
                </div>
              );
            })
          : null}
      </div>
      {children ? <div>{children}</div> : null}
    </section>
  );
}
