import DefaultView from './DefaultView';
import User from '../models/User';
import getImageUrl from '../utils/getImageUrl';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  token?: string;
  imageUrl: string | null;
}

export default class UserView extends DefaultView {
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
}
