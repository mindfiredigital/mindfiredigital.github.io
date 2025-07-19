import React from "react";
import { IconProps } from "@/types";

const ExternalRedirectIcon = ({ height, width }: IconProps) => {
  return (
    <svg
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      viewBox='0 0 24 24'
      height={height}
      width={width}
    >
      <path d='M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3' />
    </svg>
  );
};

export default ExternalRedirectIcon;
