import DefaultView from './DefaultView';
import UserRating from '../models/UserRating';

interface UserRatingResponse {
  id: number;
  userId: string;
  recipeId: number;
  rating: number;
}

export default class UserRatingView extends DefaultView {
  static render(userRating: UserRating): UserRatingResponse {
    return {
      id: userRating.id,
      userId: userRating.user.id,
      recipeId: userRating.recipe.id,
      rating: userRating.rating,
    };
  }

  static renderMany(userRatings: UserRating[]): UserRatingResponse[] {
    return userRatings.map(userRating => this.render(userRating));
  }
}
