import timersPromise from 'node:timers/promises';
import timers from 'node:timers';

const sleep = async (ms: number) => {
  await timersPromise.setTimeout(ms);
};

export async function pollPromise(
  fn: () => PromiseLike<boolean>,
  delayInMs: number,
  timeOutInMs: number,
): Promise<void> {
  let isTimeOut = false;
  let isDone = false;

  const setTimeoutId = timers.setTimeout(() => {
    isTimeOut = true;
    isDone = true;
  }, timeOutInMs);

  do {
    // eslint-disable-next-line no-await-in-loop
    isDone = await fn();
    if (isDone) {
      timers.clearTimeout(setTimeoutId);
      break;
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(delayInMs);
  } while (!isDone);

  if (isTimeOut) {
    throw new Error('Polling timeout.');
  }
}
