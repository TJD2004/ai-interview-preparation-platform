import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

/**
 * Displays a number that animates from 0 up to `value` on mount/change.
 * Purely a display component - takes the already-computed number as a prop
 * and never touches how that number is fetched or calculated.
 */
export default function AnimatedNumber({ value, decimals = 0, suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: latest => setDisplay(latest)
    });
    return () => controls.stop();
  }, [value]);

  return <span>{display.toFixed(decimals)}{suffix}</span>;
}
