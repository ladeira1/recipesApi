import Recipe from '../entities/Recipe';
import getImageUrl from '../utils/getImageUrl';

interface RecipeResponse {
  id: number;
  name: string;
  imageUrl: string | null;
  description: string;
  ingredients: string;
  steps: string;
  preparationTime: number;
  serves: number;
  rating: number;
  user: {
    name: string;
    imageUrl: string | null;
  };
}

interface GeneralRecipeResponse {
  id: number;
  name: string;
  imageUrl: string | null;
  description: string;
  rating: number;
}

interface ManyRecipesResponse {
  recipes: GeneralRecipeResponse[];
  next: { limit: number; page: number };
}

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  success: string;
}

export default class RecipeView {
  static render(recipe: Recipe): RecipeResponse {
    return {
      id: recipe.id,
      name: recipe.name,
      imageUrl: getImageUrl(recipe.imageUrl),
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      preparationTime: recipe.preparationTime,
      serves: recipe.serves,
      rating: Number(recipe.rating),
      user: {
        name: recipe.user.name,
        imageUrl: getImageUrl(recipe.user.profileImageUrl),
      },
    };
  }

  static renderGeneral(recipe: Recipe): GeneralRecipeResponse {
    return {
      id: recipe.id,
      name: recipe.name,
      imageUrl: getImageUrl(recipe.imageUrl),
      description: recipe.description,
      rating: Number(recipe.rating),
    };
  }

  static renderMany(
    recipes: Recipe[],
    page: number,
    limit: number,
  ): ManyRecipesResponse {
    return {
      recipes: recipes.map(recipe => this.renderGeneral(recipe)),
      next: { page, limit },
    };
  }

  static message(message: string): SuccessResponse {
    return { success: message };
  }

  static error(message: string): ErrorResponse {
    return { error: message };
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
