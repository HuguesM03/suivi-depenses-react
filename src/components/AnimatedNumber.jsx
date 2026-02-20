import { useState, useEffect } from 'react';

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(parseFloat(current.toFixed(2)));
      }
    }, 600 / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
};

export default AnimatedNumber;
