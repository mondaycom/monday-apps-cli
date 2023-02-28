const LOG_PROPS = {
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  LOG: 'log',
  WARN: 'warn',
};
let isDebugMode = false;
function emptyFunction() {
  return;
}

export function enableDebugMode() {
  isDebugMode = true;
}

const consoleHandler = {
  get: function (target: Console, property: keyof Console) {
    if (!isDebugMode && property === LOG_PROPS.DEBUG) {
      return emptyFunction;
    }

    return target[property];
  },
};

const Logger = new Proxy(console, consoleHandler);

export default Logger;
