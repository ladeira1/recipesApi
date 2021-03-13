/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Category from '../models/Category';
import DefaultView from './DefaultView';
import getImageUrl from '../utils/getImageUrl';

interface CategoryResponse {
  id: number;
  name: string;
  imageUrl: string;
}

interface ManyCategoriesReponse {
  categories: CategoryResponse[];
  next: { limit: number; page: number } | null;
}

export default class CategoryView extends DefaultView {
  static render(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      imageUrl: getImageUrl(category.imageUrl)!,
    };
  }

  static renderMany(
    categories: Category[],
    page: number | null,
    limit: number,
  ): ManyCategoriesReponse {
    if (!page) {
      return {
        categories: categories.map(category => this.render(category)),
        next: null,
      };
    }
    return {
      categories: categories.map(category => this.render(category)),
      next: { page, limit },
    };
  }
}
