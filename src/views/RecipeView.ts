import DefaultView from './DefaultView';
import Recipe from '../models/Recipe';
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
  category: string;
}

interface GeneralRecipeResponse {
  id: number;
  name: string;
  imageUrl: string | null;
  description: string;
  rating: number;
  category: string;
}

interface ManyRecipesResponse {
  recipes: GeneralRecipeResponse[];
  next: { limit: number; page: number } | null;
}

export default class RecipeView extends DefaultView {
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
      category: recipe.category.name,
    };
  }

  static renderGeneral(recipe: Recipe): GeneralRecipeResponse {
    return {
      id: recipe.id,
      name: recipe.name,
      imageUrl: getImageUrl(recipe.imageUrl),
      description: recipe.description,
      rating: Number(recipe.rating),
      category: recipe.category.name,
    };
  }

  static renderMany(
    recipes: Recipe[],
    page: number | null,
    limit: number,
  ): ManyRecipesResponse {
    if (!page) {
      return {
        recipes: recipes.map(recipe => this.renderGeneral(recipe)),
        next: null,
      };
    }
    return {
      recipes: recipes.map(recipe => this.renderGeneral(recipe)),
      next: { page, limit },
    };
  }
}
