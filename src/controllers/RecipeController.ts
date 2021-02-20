import { Request, Response } from 'express';
import { getConnection, getRepository, Like } from 'typeorm';
import * as Yup from 'yup';

import User from '../entities/User';
import Recipe from '../entities/Recipe';
import RecipeView from '../views/RecipeView';
import StepController from './StepController';

type TemplateTypes = 'recent' | 'top' | 'name';

const getTemplate = async (
  req: Request,
  res: Response,
  type: TemplateTypes,
  name?: string,
): Promise<Response> => {
  const page = Number(req.params.page);
  const limit = Number(req.params.limit);

  const schema = Yup.object().shape({
    page: Yup.number().required('Page must be informed'),
    limit: Yup.number().required('Limit must be informed'),
    name: Yup.string(),
  });
  // validate request data
  const validationValues = { page, limit, name };

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

    return res.status(401).json(RecipeView.manyErrors(validation));
  }
  try {
    const startIndex = (page - 1) * limit;

    const recipesRepository = getRepository(Recipe);
    let recipes;
    switch (type) {
      case 'recent': {
        recipes = await recipesRepository.find({
          order: { createdAt: 'DESC', id: 'DESC' },
          skip: startIndex,
          take: limit,
        });
        break;
      }
      case 'top': {
        recipes = await recipesRepository.find({
          order: { rating: 'DESC', createdAt: 'DESC' },
          skip: startIndex,
          take: limit,
        });
        break;
      }
      case 'name': {
        recipes = await recipesRepository.find({
          order: { rating: 'DESC', createdAt: 'DESC' },
          skip: startIndex,
          take: limit,
          where: {
            name: Like(`%${name}%`),
          },
        });
        break;
      }
      default:
        recipes = null;
    }

    if (!recipes) {
      return res.status(401).json(RecipeView.error('Recipe not found'));
    }

    return res
      .status(200)
      .json(RecipeView.renderMany(recipes, page + 1, limit));
  } catch (err) {
    return res.status(401).json(RecipeView.error(err.message));
  }
};

export default class RecipeController {
  static create = async (req: Request, res: Response): Promise<Response> => {
    const {
      name,
      description,
      ingredients,
      preparationTime,
      serves,
      steps,
    } = req.body;
    const image = req.file;

    const schema = Yup.object().shape({
      name: Yup.string().required('Recipe name has not been informed'),
      image: Yup.mixed()
        .required('Image has not been added')
        .test('fileSize', 'The file is too large', value => {
          if (value === undefined) return false;
          if (!value.length) return true;
          return value[0].size <= 2000000;
        })
        .nullable(),
      description: Yup.string().required('Description has not been informed'),
      ingredients: Yup.string().required('Ingredients have not been informed'),
      preparationTime: Yup.number().required(
        'Preparation time must be informed',
      ),
      serves: Yup.number().required(
        'The amount of people it serves must be informed',
      ),
      steps: Yup.array(Yup.string()).required('Steps have not been informed'),
    });
    // validate request data
    const validationValues = {
      name,
      image,
      description,
      ingredients,
      preparationTime,
      serves,
      steps,
    };

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

      return res.status(401).json(RecipeView.manyErrors(validation));
    }
    // create recipe
    const response = await getConnection().transaction(
      async transactionalEntityManager => {
        try {
          // const usersRepository = getRepository(User);
          const user = await transactionalEntityManager.findOne(User, {
            where: { id: req.userId },
          });

          if (!user) {
            return res.status(401).json('User not found');
          }

          const recipe = transactionalEntityManager.create(Recipe, {
            name,
            imageUrl: image.filename,
            description,
            ingredients,
            preparationTime,
            serves,
            rating: 0,
            createdAt: new Date(),
            user,
          });

          await transactionalEntityManager.save(recipe);

          // create steps
          const createdSteps = await StepController.createSteps(
            steps,
            recipe,
            transactionalEntityManager,
          );

          if ('error' in createdSteps) {
            return res.status(400).json(RecipeView.error(createdSteps.error));
          }

          return res.status(201).json(RecipeView.render(recipe, createdSteps));
        } catch (err) {
          return res.status(400).json(RecipeView.error(String(err.message)));
        }
      },
    );

    return response;
  };

  static index = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    try {
      const recipesRepository = getRepository(Recipe);
      const recipe = await recipesRepository.findOne({ where: { id } });

      if (!recipe) {
        return res.status(401).json(RecipeView.error('Recipe not found'));
      }

      return res.status(200).json(RecipeView.render(recipe));
    } catch (err) {
      return res.status(401).json(RecipeView.error(err.message));
    }
  };

  static getRecent = async (req: Request, res: Response): Promise<Response> =>
    getTemplate(req, res, 'recent');

  static getTopRated = async (req: Request, res: Response): Promise<Response> =>
    getTemplate(req, res, 'top');

  static getByName = async (req: Request, res: Response): Promise<Response> =>
    getTemplate(req, res, 'name', req.body.name);
}
