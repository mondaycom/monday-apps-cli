import { setTimeout } from 'node:timers/promises';
import { createSpinner } from 'nanospinner';
import { LoginArguments } from '../types/services/monday-api-service';

export const MondayApiService = {
  async login(loginArgs: LoginArguments) {
    const loginSpinner = createSpinner().start();
    await setTimeout(2000);
    const successMessage = Object.entries(loginArgs)
      .map(entry => entry.join(': '))
      .join(', ');
    loginSpinner.success({ text: successMessage });
  },
};
