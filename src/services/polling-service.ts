import { setTimeout as asyncSetTimeout } from 'node:timers/promises';

const sleep = async (ms: number) => {
  await asyncSetTimeout(ms);
};

export async function pollPromise(
  fn: () => PromiseLike<boolean>,
  delayInMs: number,
  timeOutInMs: number,
): Promise<void> {
  let isTimeOut = false;
  let isDone = false;

  const setTimeoutId = setTimeout(() => {
    isTimeOut = true;
    isDone = true;
  }, timeOutInMs);

  do {
    // eslint-disable-next-line no-await-in-loop
    isDone = await fn();
    if (isDone) {
      clearTimeout(setTimeoutId);
      return;
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(delayInMs);
  } while (!isDone);

  if (isTimeOut) {
    throw new Error('Polling timeout.');
  }
}
