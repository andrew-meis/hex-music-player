export const imageMotion = {
  hover: {
    scale: [1, 1.025, 1],
    transition: {
      duration: 0.4,
    },
  },
};

export const iconMotion = {
  hover: {
    x: [0, 4, 0],
    transition: {
      duration: 0.4,
      type: 'tween',
    },
  },
};

export const tracklistMotion = {
  enter: (difference: number) => {
    if (difference > 0) {
      return {
        x: 10,
        opacity: 0,
      };
    }
    if (difference < 0) {
      return {
        x: -10,
        opacity: 0,
      };
    }
    return {
      x: 0,
      opacity: 1,
    };
  },
  exit: (difference: number) => {
    if (difference > 0) {
      return {
        x: -10,
        opacity: 0,
      };
    }
    if (difference < 0) {
      return {
        x: 10,
        opacity: 0,
      };
    }
    return {
      x: 0,
      opacity: 1,
    };
  },
};
