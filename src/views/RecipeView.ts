import Recipe from '../entities/Recipe';
import getImageUrl from '../utils/getImageUrl';

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
  static render(
    recipe: Recipe,
    steps?: { id: number; content: string }[],
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
      steps: steps || recipe.steps,
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
