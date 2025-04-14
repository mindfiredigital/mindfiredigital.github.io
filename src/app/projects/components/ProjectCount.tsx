"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import project from "../../../../public/images/social-media/project.svg";
import { BorderBeam } from "../../../components/shared/BorderBeam";

interface ProjectCountProps {
  totalProjects: number;
}

const ProjectCount = ({ totalProjects }: ProjectCountProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 60;
    const increment = totalProjects / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalProjects) {
        setCount(totalProjects);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalProjects]);

  return (
    <div className='relative rounded-full'>
      <div className='relative flex items-center gap-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-full shadow-md shadow-red-300 py-2 px-4 hover:shadow-xl transition-shadow duration-300'>
        <span className='text-3xl font-bold bg-gradient-to-r from-mindfire-text-red to-orange-500 bg-clip-text text-transparent'>
          {count}
        </span>
        <Image
          src={project}
          height={30}
          width={30}
          alt='total_projects'
          className='rounded-3xl animate-bounce'
        />
      </div>
      <BorderBeam
        duration={4}
        size={70}
        className='from-transparent via-mindfire-text-red to-orange-500'
      />
    </div>
  );
};

export default ProjectCount;
