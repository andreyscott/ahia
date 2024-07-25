import HttpStatusCode from "../enum/httpStatusCode";

abstract class BaseError extends Error {
  public readonly name: string;
  public readonly httpStatusCode: number | HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(
    name: string,
    httpStatusCode: number | HttpStatusCode,
    isOperational: boolean,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpStatusCode = httpStatusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export default BaseError;
