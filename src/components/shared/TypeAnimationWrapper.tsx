"use client";

import { ComponentProps } from "react";
import { TypeAnimation } from "react-type-animation";

interface Props extends ComponentProps<typeof TypeAnimation> {}

const TypeAnimationWrapper = (props: Props) => {
  return (
    <TypeAnimation
      preRenderFirstString={true}
      wrapper='span'
      speed={{ type: "keyStrokeDelayInMs", value: 150 }}
      style={{ color: "#F81F1F" }}
      repeat={Infinity}
      {...props}
    />
  );
};

export default TypeAnimationWrapper;
