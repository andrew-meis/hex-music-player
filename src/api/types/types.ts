// @ts-nocheck
import Prism from '@zwolf/prism';

const toBoolean = ($data: Prism<any>): boolean => {
  const { value } = $data;
  if (value == null) {
    return undefined;
  }
  return value === 1 || value === '1' || value === 'true' || value === true;
};

const toNumber = ($data: Prism<any>): number => {
  const { value } = $data;
  if (value == null) {
    return undefined;
  }
  return parseInt(value, 10);
};

const toFloat = ($data: Prism<any>): number => {
  const { value } = $data;
  if (value == null) {
    return undefined;
  }
  return parseFloat(value);
};

const toTimestamp = ($data: Prism<any>) => {
  const { value } = $data;
  if (value == null) {
    return undefined;
  }
  return $data.transform(toNumber).value * 1000;
};

const toDate = ($data: Prism<any>): Date => {
  const { value } = $data;
  if (value == null) {
    return undefined;
  }
  return new Date($data.value);
};

const toDateFromSeconds = ($data: Prism<any>): Date => $data
  .transform(toTimestamp).transform(toDate).value;

export { toBoolean, toNumber, toFloat, toTimestamp, toDate, toDateFromSeconds };
