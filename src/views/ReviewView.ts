import DefaultView from './DefaultView';
import Review from '../models/Review';

interface ReviewResponse {
  id: number;
  content: string;
  createdAt: Date;
  recipeId: number;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ManyReviewsResponse {
  reviews: ReviewResponse[];
  next: { limit: number; page: number } | null;
}

export default class ReviewView extends DefaultView {
  static render = (review: Review): ReviewResponse => {
    return {
      id: review.id,
      content: review.content,
      createdAt: review.createdAt,
      recipeId: review.recipe.id,
      user: {
        id: review.user.id,
        name: review.user.name,
        image: review.user.profileImageUrl ? review.user.profileImageUrl : null,
      },
    };
  };

  static renderMany = (
    reviews: Review[],
    page: number | null,
    limit: number,
  ): ManyReviewsResponse => {
    if (!page) {
      return {
        reviews: reviews.map(review => ReviewView.render(review)),
        next: null,
      };
    }

    return {
      reviews: reviews.map(review => ReviewView.render(review)),
      next: { page, limit },
    };
  };
}
