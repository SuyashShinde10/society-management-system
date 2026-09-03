import { ERROR_CODES } from '../constants/errorCodes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(errorCode: string, customMessage?: string, statusCode?: number, details?: any) {
    const defaultMeta = ERROR_CODES[errorCode];
    const message = customMessage || defaultMeta?.message || errorCode;
    super(message);

    this.errorCode = errorCode;
    this.statusCode = statusCode || defaultMeta?.status || 400;
    this.isOperational = true;
    this.details = details || null;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
