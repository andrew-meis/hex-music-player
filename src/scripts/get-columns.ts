export const getColumns = (width: number) => {
  let quotient = Infinity;
  let i = 1;
  while (quotient > 300) {
    quotient = width / i;
    if (quotient < 300) break;
    i += 1;
  }
  return i;
};

export const getColumnsNarrow = (width: number) => {
  let quotient = Infinity;
  let i = 1;
  while (quotient > 250) {
    quotient = width / i;
    if (quotient < 250) break;
    i += 1;
  }
  return i;
};

export const getColumnsWide = (width: number) => {
  let quotient = Infinity;
  let i = 1;
  while (quotient > 450) {
    quotient = width / i;
    if (quotient < 450) break;
    i += 1;
  }
  return i;
};
