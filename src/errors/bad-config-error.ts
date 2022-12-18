import { BaseError } from './base-error.js';
import { ErrorParams } from '../types/errors/index.js';

export class BadConfigError extends BaseError {
  constructor(public message: string, public params: ErrorParams = {}) {
    super(message, params);
  }
}
