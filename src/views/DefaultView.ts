interface SuccessResponse {
  success: string;
}

interface ErrorResponse {
  error: string;
}

export default class DefaultView {
  static success(message: string): SuccessResponse {
    return { success: message };
  }

  static error(message: string): ErrorResponse {
    return { error: message };
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
