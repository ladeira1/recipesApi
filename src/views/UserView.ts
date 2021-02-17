import User from '../entities/User';

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

type ErrorResponse = string;

export default class UserView {
  static render(user: User): UserResponse {
    return { id: user.id, name: user.name, email: user.email };
  }

  static error(message: string): ErrorResponse {
    return message;
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
