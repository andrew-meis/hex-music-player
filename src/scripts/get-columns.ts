export const getColumns = (width: number) => {
  if (width >= 1350) {
    return 6;
  }
  if (width < 1350 && width >= 1100) {
    return 5;
  }
  if (width < 1100 && width >= 850) {
    return 4;
  }
  if (width < 850 && width >= 650) {
    return 3;
  }
  if (width < 650) {
    return 2;
  }
  return 4;
};

export const getColumnsNarrow = (width: number) => {
  if (width >= 1350) {
    return 7;
  }
  if (width < 1350 && width >= 1100) {
    return 6;
  }
  if (width < 1100 && width >= 850) {
    return 5;
  }
  if (width < 850 && width >= 650) {
    return 4;
  }
  if (width < 650) {
    return 3;
  }
  return 5;
};
