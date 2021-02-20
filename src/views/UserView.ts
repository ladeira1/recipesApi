import User from '../entities/User';
import getImageUrl from '../utils/getImageUrl';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  token?: string;
  imageUrl: string | null;
}

interface ErrorResponse {
  error: string;
}

export default class UserView {
  static render(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: getImageUrl(user.profileImageUrl),
    };
  }

  static renderToken(user: User, token: string): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
      imageUrl: getImageUrl(user.profileImageUrl),
    };
  }

  static error(message: string): ErrorResponse {
    return { error: message };
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
