"use client";

import Image from "next/image";
import project from "../../../../public/images/social-media/project.svg";
import { BorderBeam } from "../../../components/shared/BorderBeam";
import { ProjectCountProps } from "@/types";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

/* Displays an animated project count badge with visual effects */
const ProjectCount = ({ totalProjects }: ProjectCountProps) => {
  const duration = 800;

  /* Custom hook to animate the counter from 0 to totalProjects */
  const count = useAnimatedCounter(totalProjects, duration);

  return (
    <div className='relative rounded-full'>
      {/* Badge container with glass effect and hover shadow */}
      <div className='relative flex items-center gap-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-full shadow-md shadow-red-300 py-2 px-4 hover:shadow-xl transition-shadow duration-300'>
        {/* Animated numeric counter */}
        <span className='text-3xl font-bold bg-gradient-to-r from-mindfire-text-red to-orange-500 bg-clip-text text-transparent'>
          {count}
        </span>

        {/* Decorative project icon */}
        <Image
          src={project}
          height={30}
          width={30}
          alt='total_projects'
          className='rounded-3xl animate-bounce'
        />
      </div>

      {/* Animated border glow effect */}
      <BorderBeam
        duration={4}
        size={70}
        className='from-transparent via-mindfire-text-red to-orange-500'
      />
    </div>
  );
};

export default ProjectCount;
