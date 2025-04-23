import { TIME_IN_MILLISECONDS } from 'utils/time-utils';

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

export function isDefined<T>(input: T | null | undefined): input is T {
  return input !== null && input !== undefined;
}

export function isDefinedAndNotEmpty<T>(input: T | null | undefined): input is T {
  if (!isDefined(input)) return false;
  if (typeof input === 'string') return input.trim() !== '';
  if (Array.isArray(input)) return input.length > 0;
  if (typeof input === 'object') return Object.keys(input as Record<string, unknown>).length > 0;
  return true;
}

/***
 * This function receives an input (string or number) and returns true if it is a number
 * @param input - The input to check if it is a number
 * @returns true if the input is a number
 */
export function isANumber(input: unknown): input is number {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return isDefined(input) && `${Number(input)}` === `${input}` && Number.isFinite(input);
}
