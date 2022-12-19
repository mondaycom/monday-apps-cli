function emptyFunction() {
  return;
}

const consoleHandler = {
  get: function (target: Console, property: keyof Console) {
    if (property === 'debug' && process.env.NODE_ENV !== 'development') {
      return emptyFunction;
    }

    return target[property];
  },
};

const Logger = new Proxy(console, consoleHandler);

export default Logger;
