const repeatChar = (char: string, times: number): string =>
  Array.from({ length: Math.round(times) })
    .map(() => char)
    .join('');

export const createProgressBarString = (max: number, current: number, timeInSeconds?: number): string => {
  const progress = Math.round((current / max) * 100);
  const totalChars = 50;
  const normalizedProgress = Math.round(progress / 2);
  const progressBar = repeatChar('█', normalizedProgress) + repeatChar('░', totalChars - normalizedProgress);
  return `${progressBar} ${progress}%${timeInSeconds ? `, ${Math.round(timeInSeconds)} Seconds` : ''}`;
};
