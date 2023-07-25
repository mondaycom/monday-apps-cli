import { TIME_IN_MILLISECONDS } from 'utils/time-enum';

export const isDate = (value: string | null | undefined): boolean => {
  if (!value) {
    return false;
  }

  return new Date(value).toString() !== 'Invalid Date';
};

export const getDayDiff = (fromDate: Date, toDate: Date): number | null => {
  if (!fromDate.getTime || !toDate.getTime) {
    return null;
  }

  const diffInMS = toDate.getTime() - fromDate.getTime();
  return diffInMS / TIME_IN_MILLISECONDS.DAY;
};
