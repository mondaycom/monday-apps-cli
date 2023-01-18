const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = SECOND_IN_MS * 60;
const HOUR_IN_MS = MINUTE_IN_MS * 60;

export enum TimeInMs {
  second = SECOND_IN_MS,
  minute = MINUTE_IN_MS,
  hour = HOUR_IN_MS,
}
