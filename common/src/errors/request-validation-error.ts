import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

// interface CustomError {
//   statusCode: number;
//   serializeErrors(): {
//     message: string;
//     field?: string;
//   }[];
// }

export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super("Invalid req params");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((error: any) => {
      return { message: error.msg, field: error?.path };
    });
  }
}
