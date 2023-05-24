import { createSpinner } from 'nanospinner';

class Spinner {
  pushSpinner = createSpinner();

  setText(message: string) {
    this.pushSpinner.update({ text: message });
  }

  setError(message: string) {
    this.setText('');
    this.pushSpinner.error({ text: message });
  }

  setSuccess(message: string) {
    this.pushSpinner.success({ text: message });
  }

  setWarn(message: string) {
    this.pushSpinner.warn({ text: message });
  }

  clear() {
    this.pushSpinner.clear();
  }

  start() {
    this.pushSpinner.start();
  }

  stop() {
    this.pushSpinner.stop();
  }
}

export const spinner = new Spinner();
