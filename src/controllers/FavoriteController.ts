import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import User from '../models/User';
import Recipe from '../models/Recipe';
import Favorite from '../models/Favorite';

import FavoriteView from '../views/FavoriteView';

export default class RecipeController {
  static create = async (req: Request, res: Response): Promise<Response> => {
    const { recipeId } = req.body;

    const schema = Yup.object().shape({
      recipeId: Yup.number().required('Recipe must be informed'),
    });

    // validate request data
    if (!(await schema.isValid({ recipeId }))) {
      const validation = await schema
        .validate(
          { recipeId },
          {
            abortEarly: false,
          },
        )
        .catch(err => {
          const errors = err.errors.map((message: string) => {
            return message;
          });
          return errors;
        });

      return res.status(401).json(FavoriteView.manyErrors(validation));
    }

    // create favorite
    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });

      if (!user) {
        return res.status(401).json(FavoriteView.error('User not found'));
      }

      const recipesRepository = getRepository(Recipe);
      const recipe = await recipesRepository.findOne({
        where: { id: recipeId },
      });

      if (!recipe) {
        return res.status(401).json(FavoriteView.error('Recipe not found'));
      }

      const favoritesRepository = getRepository(Favorite);
      const favorite = favoritesRepository.create({
        user,
        recipe,
        createdAt: new Date(),
      });

      await favoritesRepository.save(favorite);
      return res.status(201).json(FavoriteView.render(favorite));
    } catch (err) {
      return res.status(400).json(FavoriteView.error(String(err.message)));
    }
  };

  static getUsersFavorites = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const page = Number(req.params.page);
    const limit = Number(req.params.limit);

    const schema = Yup.object().shape({
      page: Yup.number().required('Page must be informed'),
      limit: Yup.number().required('Limit must be informed'),
    });

    // validate request data
    const validationValues = { page, limit };

    if (!(await schema.isValid(validationValues))) {
      const validation = await schema
        .validate(validationValues, {
          abortEarly: false,
        })
        .catch(err => {
          const errors = err.errors.map((message: string) => {
            return message;
          });
          return errors;
        });

      return res.status(401).json(FavoriteView.manyErrors(validation));
    }

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });
      if (!user) {
        return res.status(401).json(FavoriteView.error('User not found'));
      }

      const startIndex = (page - 1) * limit;
      const favoritesRepository = getRepository(Favorite);

      const favorites = await favoritesRepository.find({
        where: { user },
        order: { createdAt: 'ASC', id: 'ASC' },
        skip: startIndex,
        take: limit,
      });

      if (!favorites || favorites.length === 0) {
        return res.status(401).json(FavoriteView.error('Review not found'));
      }

      if (favorites.length < limit) {
        return res
          .status(200)
          .json(FavoriteView.renderMany(favorites, null, limit));
      }

      return res
        .status(200)
        .json(FavoriteView.renderMany(favorites, page + 1, limit));
    } catch (err) {
      return res.status(401).json(FavoriteView.error(err.message));
    }
  };
}
