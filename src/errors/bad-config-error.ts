import { BaseError } from 'errors/base-error';
import { ErrorParams } from 'types/errors';

export class BadConfigError extends BaseError {
  constructor(
    public message: string,
    public params: ErrorParams = {},
  ) {
    super(message, params);
  }
}
