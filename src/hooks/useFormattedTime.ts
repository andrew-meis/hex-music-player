import { useCallback } from 'react';

const useFormattedTime = () => {
  const getFormattedTime = useCallback((inMS: number) => {
    if (inMS === undefined) {
      return '--:--';
    }
    if (Number.isNaN(inMS)) {
      return '--:--';
    }
    if (inMS < 0) {
      return '00:00';
    }
    let minutes: number | string = Math.floor(inMS / 60000);
    const secondsFull = (inMS - (minutes * 60000)) / 1000;
    let seconds: number | string = Math.floor(secondsFull);

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  }, []);

  return { getFormattedTime };
};

export default useFormattedTime;
