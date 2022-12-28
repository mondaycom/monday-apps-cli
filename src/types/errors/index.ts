import { StatusCodes } from 'http-status-codes';

export type ErrorParamsValues = string | number | Date | null | undefined;
export type ErrorParams = Record<string, ErrorParamsValues>;
export class ErrorMondayCode extends Error {
  private code;
  private description;
  private title;

  constructor(message: string, title?: string | null, code?: number | null) {
    super(message);
    this.code = code;
    this.name = 'ErrorSignedUrl';
    switch (code) {
      case StatusCodes.BAD_REQUEST: {
        this.description =
          'The request could not be understood by the server due to malformed syntax or missing request header.';
        break;
      }

      case StatusCodes.UNAUTHORIZED: {
        this.description =
          'The request has not been applied because it lacks valid authentication credentials for the target resource.';
        break;
      }

      case StatusCodes.INTERNAL_SERVER_ERROR: {
        this.description = 'An unexpected error occurred on the server.';
        break;
      }

      default: {
        this.description = 'An error.';
      }
    }

    this.title = title;
    this.message = message;
  }
}
