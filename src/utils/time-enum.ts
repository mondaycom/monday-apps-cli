const SECOND_IN_MILLISECOND = 1000;

export enum TIME_IN_SECONDS {
  YEAR = Number(365 * 24 * 60 * 60),
  MONTH31Days = Number(31 * 24 * 60 * 60),
  MONTH30Days = Number(30 * 24 * 60 * 60),
  MONTH29Days = Number(29 * 24 * 60 * 60),
  MONTH28Days = Number(28 * 24 * 60 * 60),
  DAY = Number(24 * 60 * 60),
  HOUR = Number(60 * 60),
  MINUTE = 60,
}

export enum TIME_IN_MILLISECONDS {
  YEAR = Number(365 * 24 * 60 * 60 * SECOND_IN_MILLISECOND),
  MONTH31Days = Number(31 * 24 * 60 * 60 * SECOND_IN_MILLISECOND),
  MONTH30Days = Number(30 * 24 * 60 * 60 * SECOND_IN_MILLISECOND),
  MONTH29Days = Number(29 * 24 * 60 * 60 * SECOND_IN_MILLISECOND),
  MONTH28Days = Number(28 * 24 * 60 * 60 * SECOND_IN_MILLISECOND),
  DAY = Number(24 * 60 * 60 * SECOND_IN_MILLISECOND),
  HOUR = Number(60 * 60 * SECOND_IN_MILLISECOND),
  MINUTE = Number(60 * SECOND_IN_MILLISECOND),
  SECOND = SECOND_IN_MILLISECOND,
}
