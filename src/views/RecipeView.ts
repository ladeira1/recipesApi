import Recipe from '../entities/Recipe';
import Step from '../entities/Step';
import getImageUrl from '../utils/getImageUrl';
import StepsView from './StepsView';

interface RecipeResponse {
  id: number;
  name: string;
  imageUrl: string | null;
  description: string;
  ingredients: string;
  preparationTime: number;
  serves: number;
  user: {
    name: string;
    imageUrl: string | null;
  };
  steps: {
    id: number;
    content: string;
  }[];
}

interface ErrorResponse {
  error: string;
}

export default class RecipeView {
  static render(
    recipe: Recipe,
    steps: { id: number; content: string }[],
  ): RecipeResponse {
    return {
      id: recipe.id,
      name: recipe.name,
      imageUrl: getImageUrl(recipe.imageUrl),
      description: recipe.description,
      ingredients: recipe.ingredients,
      preparationTime: recipe.preparationTime,
      serves: recipe.serves,
      user: {
        name: recipe.user.name,
        imageUrl: getImageUrl(recipe.user.profileImageUrl),
      },
      steps,
    };
  }

  static error(message: string): ErrorResponse {
    return { error: message };
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
