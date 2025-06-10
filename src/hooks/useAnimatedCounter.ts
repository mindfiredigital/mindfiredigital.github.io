import { useEffect, useState } from "react";

export function useAnimatedCounter(
  target: number,
  duration = 2000,
  steps = 60
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return count;
}
