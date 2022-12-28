let isDebugMode = false;
function emptyFunction() {
  return;
}

export function enableDebugMode() {
  isDebugMode = true;
}

const consoleHandler = {
  get: function (target: Console, property: keyof Console) {
    if (!isDebugMode) {
      return emptyFunction;
    }

    return target[property];
  },
};

const Logger = new Proxy(console, consoleHandler);

export default Logger;
