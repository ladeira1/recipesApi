import { getConnection, Not } from 'typeorm';
import { Request, Response } from 'express';
import * as Yup from 'yup';

import User from '../entities/User';
import Recipe from '../entities/Recipe';
import UserRating from '../entities/UserRating';

import UserRatingView from '../views/UserRatingView';

export default class UserRatingController {
  static create = async (req: Request, res: Response): Promise<Response> => {
    const { recipeId, rating } = req.body;

    const schema = Yup.object().shape({
      recipeId: Yup.number().required('Recipe must be informed'),
      rating: Yup.number()
        .required('Rating must be informed')
        .min(0, 'Rate must be at least 0')
        .max(5, 'Rate must not be higher than 5'),
    });
    // validate request data
    const validationValues = { recipeId, rating };
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
      return res.status(401).json(UserRatingView.manyErrors(validation));
    }

    // create rating
    return getConnection()
      .transaction(async transactionalEntityManager => {
        try {
          const user = await transactionalEntityManager.findOne(User, {
            where: { id: req.userId },
          });

          if (!user) {
            return res.status(401).json(UserRatingView.error('User not found'));
          }

          const recipe = await transactionalEntityManager.findOne(Recipe, {
            where: { id: recipeId },
          });

          if (!recipe) {
            return res
              .status(401)
              .json(UserRatingView.error('Recipe not found'));
          }

          // get all ratings related to this recipe
          const allRatings = await transactionalEntityManager.find(UserRating, {
            where: { recipe },
          });

          const newRating = transactionalEntityManager.create(UserRating, {
            recipe,
            user,
            rating,
          });

          if (!allRatings || allRatings.length === 0) {
            recipe.rating = Number(rating);
          } else {
            let newRatingValue = Number(rating);
            let counter = 1;

            allRatings.forEach(r => {
              newRatingValue += Number(r.rating);
              counter += 1;
            });

            recipe.rating = newRatingValue / counter;
          }

          await transactionalEntityManager.save(newRating);
          await transactionalEntityManager.save(recipe);

          return res.status(201).json(UserRatingView.render(newRating));
        } catch (err) {
          return res
            .status(400)
            .json(UserRatingView.error(String(err.message)));
        }
      })
      .then(r => r);
  };

  static update = async (req: Request, res: Response): Promise<Response> => {
    const { id, recipeId, rating } = req.body;

    const schema = Yup.object().shape({
      id: Yup.number().required('Rating must be informed'),
      recipeId: Yup.number().required('Recipe must be informed'),
      rating: Yup.number()
        .required('Rating must be informed')
        .min(0, 'Rate must be at least 0')
        .max(5, 'Rate must not be higher than 5'),
    });

    // validate request data
    const validationValues = { id, recipeId, rating };
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
      return res.status(401).json(UserRatingView.manyErrors(validation));
    }

    // update rating
    return getConnection()
      .transaction(async transactionalEntityManager => {
        try {
          const user = await transactionalEntityManager.findOne(User, {
            where: { id: req.userId },
          });

          if (!user) {
            return res.status(401).json(UserRatingView.error('User not found'));
          }

          const currentRating = await transactionalEntityManager.findOne(
            UserRating,
            {
              where: { id, user },
            },
          );

          if (!currentRating) {
            return res
              .status(401)
              .json(UserRatingView.error('Rating not found'));
          }

          const recipe = await transactionalEntityManager.findOne(Recipe, {
            where: { id: recipeId },
          });

          if (!recipe) {
            return res
              .status(401)
              .json(UserRatingView.error('Recipe not found'));
          }

          // get all ratings related to this recipe except the one related to this user
          const allRatings = await transactionalEntityManager.find(UserRating, {
            where: { recipe, id: Not(id) },
          });

          currentRating.rating = Number(rating);

          if (!allRatings || allRatings.length === 0) {
            recipe.rating = Number(rating);
          } else {
            let newRatingValue = Number(rating);
            let counter = 1;

            allRatings.forEach(r => {
              newRatingValue += Number(r.rating);
              counter += 1;
            });

            recipe.rating = newRatingValue / counter;
          }

          await transactionalEntityManager.save(currentRating);
          await transactionalEntityManager.save(recipe);

          return res.status(201).json(UserRatingView.render(currentRating));
        } catch (err) {
          return res
            .status(400)
            .json(UserRatingView.error(String(err.message)));
        }
      })
      .then(r => r);
  };
}
