import UserRating from '../entities/UserRating';

interface UserRatingResponse {
  userId: string;
  recipeId: number;
  rating: number;
}

interface ErrorResponse {
  error: string;
}

export default class UserRatingView {
  static render(userRating: UserRating): UserRatingResponse {
    return {
      userId: userRating.user.id,
      recipeId: userRating.recipe.id,
      rating: userRating.rating,
    };
  }

  static renderMany(userRatings: UserRating[]): UserRatingResponse[] {
    return userRatings.map(userRating => this.render(userRating));
  }

  static error(message: string): ErrorResponse {
    return { error: message };
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
