import User from '../entities/User';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  token?: string;
}

interface ErrorResponse {
  error: string;
}

export default class UserView {
  static render(user: User): UserResponse {
    return { id: user.id, name: user.name, email: user.email };
  }

  static renderToken(user: User, token: string): UserResponse {
    return { id: user.id, name: user.name, email: user.email, token };
  }

  static error(message: string): ErrorResponse {
    return { error: message };
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
