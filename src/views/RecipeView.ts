import Recipe from '../entities/Recipe';

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
    profileImageUrl: string | null;
  };
}

interface ErrorResponse {
  error: string;
}

export default class RecipeView {
  static render(recipe: Recipe): RecipeResponse {
    return {
      id: recipe.id,
      name: recipe.name,
      imageUrl: `http://localhost:3333/uploads/${recipe.imageUrl}`,
      description: recipe.description,
      ingredients: recipe.ingredients,
      preparationTime: recipe.preparationTime,
      serves: recipe.serves,
      user: {
        name: recipe.user.name,
        profileImageUrl: recipe.user.profileImageUrl,
      },
    };
  }

  static error(message: string): ErrorResponse {
    return { error: message };
  }

  static manyErrors(errorMessages: string[]): ErrorResponse[] {
    return errorMessages.map(err => this.error(err));
  }
}
