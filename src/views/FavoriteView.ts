import DefaultView from './DefaultView';
import Favorite from '../models/Favorite';
import getImageUrl from '../utils/getImageUrl';

interface FavoriteResponse {
  id: number;
  recipe: {
    id: number;
    name: string;
    imageUrl: string | null;
    description: string;
    rating: number;
  };
  createdAt: Date;
}

interface ManyFavoritesReponse {
  favorites: FavoriteResponse[];
  next: { limit: number; page: number } | null;
}

export default class FavoriteView extends DefaultView {
  static render(favorite: Favorite): FavoriteResponse {
    return {
      id: favorite.id,
      recipe: {
        id: favorite.recipe.id,
        name: favorite.recipe.name,
        imageUrl: getImageUrl(favorite.recipe.imageUrl),
        description: favorite.recipe.description,
        rating: Number(favorite.recipe.rating),
      },
      createdAt: favorite.createdAt,
    };
  }

  static renderMany(
    favorites: Favorite[],
    page: number | null,
    limit: number,
  ): ManyFavoritesReponse {
    if (!page) {
      return {
        favorites: favorites.map(favorite => this.render(favorite)),
        next: null,
      };
    }
    return {
      favorites: favorites.map(favorite => this.render(favorite)),
      next: { page, limit },
    };
  }
}
