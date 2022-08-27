import { useEffect, useState } from 'react';
import { Location } from 'react-router-dom';

const useImageTransition = (src: string, location: Location) => {
  const [opacity, setOpacity] = useState(0);
  const [current, setCurrent] = useState('');

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setOpacity(1);
    img.onerror = () => setOpacity(1);
    img.src = src;
    return () => setOpacity(0);
  }, [src]);

  const getOpacity = () => {
    if (opacity === 0) {
      return 0;
    }
    if (opacity === 1 && location.pathname !== current) {
      return 0;
    }
    if (opacity === 1 && location.pathname === current) {
      return 1;
    }
  };

  return { getOpacity, opacity };
};

export default useImageTransition;
