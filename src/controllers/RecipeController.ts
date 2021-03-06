import { Request, Response } from 'express';
import { getRepository, Like } from 'typeorm';
import * as Yup from 'yup';
import { fs } from 'mz';
import path from 'path';

import Category from '../models/Category';
import User from '../models/User';
import Recipe from '../models/Recipe';
import RecipeView from '../views/RecipeView';

type TemplateTypes = 'recent' | 'top' | 'name' | 'category';

const getTemplate = async (
  req: Request,
  res: Response,
  type: TemplateTypes,
  data?: string,
): Promise<Response> => {
  const page = Number(req.params.page);
  const limit = Number(req.params.limit);

  const schema = Yup.object().shape({
    page: Yup.number().required('Page must be informed'),
    limit: Yup.number().required('Limit must be informed'),
    data:
      type === 'category'
        ? Yup.number().required('Category must be informed')
        : Yup.string(),
  });
  // validate request data
  const validationValues = { page, limit, data };

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
            name: Like(`%${data}%`),
          },
        });
        break;
      }
      case 'category': {
        const categoriesRepository = getRepository(Category);
        const category = await categoriesRepository.findOne({
          where: { id: data },
        });

        if (!category) {
          return res.status(401).json(RecipeView.error('Category not found'));
        }

        recipes = await recipesRepository.find({
          order: { rating: 'DESC', createdAt: 'DESC' },
          skip: startIndex,
          take: limit,
          where: {
            category,
          },
        });
        break;
      }
      default:
        recipes = null;
    }

    if (!recipes || recipes.length === 0) {
      return res.status(401).json(RecipeView.error('Recipe not found'));
    }

    if (recipes.length < limit) {
      return res.status(200).json(RecipeView.renderMany(recipes, null, limit));
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
      categoryId,
    } = req.body;
    const image = req.file;

    const schema = Yup.object().shape({
      name: Yup.string().required('Recipe name must be informed'),
      image: Yup.mixed()
        .required('Image must be informed')
        .test('fileSize', 'The file is too large', value => {
          if (value === undefined) return false;
          if (!value.length) return true;
          return value[0].size <= 2000000;
        }),
      description: Yup.string().required('Description must be informed'),
      ingredients: Yup.string().required('Ingredients must be informed'),
      preparationTime: Yup.number().required(
        'Preparation time must be informed',
      ),
      serves: Yup.number().required(
        'The amount of people it serves must be informed',
      ),
      steps: Yup.string().required('Steps must be informed'),
      categoryId: Yup.number().required('Category must be informed'),
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
      categoryId,
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
    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });

      if (!user) {
        return res.status(401).json(RecipeView.error('User not found'));
      }

      const categoriesRepository = getRepository(Category);
      const category = await categoriesRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(401).json(RecipeView.error('Category not found'));
      }

      const recipesRepository = getRepository(Recipe);
      const recipe = recipesRepository.create({
        name,
        imageUrl: image.filename,
        description,
        ingredients,
        steps,
        preparationTime,
        serves,
        rating: 0,
        createdAt: new Date(),
        user,
        category,
      });

      await recipesRepository.save(recipe);
      return res.status(201).json(RecipeView.render(recipe));
    } catch (err) {
      return res.status(400).json(RecipeView.error(String(err.message)));
    }
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

  static getByCategory = async (
    req: Request,
    res: Response,
  ): Promise<Response> =>
    getTemplate(req, res, 'category', req.params.categoryId);

  static update = async (req: Request, res: Response): Promise<Response> => {
    const {
      id,
      name,
      description,
      ingredients,
      preparationTime,
      serves,
      steps,
      categoryId,
    } = req.body;
    const image = req.file;

    const schema = Yup.object().shape({
      id: Yup.number().required('Recipe must be informed'),
      name: Yup.string().nullable(),
      image: Yup.mixed()
        .test('fileSize', 'The file is too large', value => {
          if (value === undefined) return true;
          if (!value.length) return true;
          return value[0].size <= 2000000;
        })
        .nullable(),
      description: Yup.string().nullable(),
      ingredients: Yup.string().nullable(),
      preparationTime: Yup.number().nullable(),
      serves: Yup.number().nullable(),
      steps: Yup.string().nullable(),
      categoryId: Yup.number().nullable(),
    });
    // validate request data
    const validationValues = {
      id,
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

    try {
      const recipesRepository = getRepository(Recipe);
      const recipe = await recipesRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!recipe) {
        return res.status(401).json(RecipeView.error('Recipe not found'));
      }

      if (name) {
        recipe.name = name;
      }

      if (image) {
        await fs
          .unlink(
            path.resolve(__dirname, '..', '..', 'uploads', recipe.imageUrl),
          )
          .catch(err => res.status(401).json(RecipeView.error(err.message)));

        recipe.imageUrl = image.filename;
      }

      if (description) {
        recipe.description = description;
      }

      if (ingredients) {
        recipe.ingredients = ingredients;
      }

      if (steps) {
        recipe.steps = steps;
      }

      if (preparationTime) {
        recipe.preparationTime = Number(preparationTime);
      }

      if (serves) {
        recipe.serves = Number(serves);
      }

      if (categoryId !== recipe.category.id) {
        const categoriesRepository = getRepository(Category);
        const newCategory = await categoriesRepository.findOne({
          where: { id: categoryId },
        });

        if (!newCategory) {
          return res.status(401).json(RecipeView.error('Category not found'));
        }

        recipe.category = newCategory;
      }

      await recipesRepository.save(recipe);
      return res.status(200).json(RecipeView.render(recipe));
    } catch (err) {
      return res.status(401).json(RecipeView.error(err.message));
    }
  };

  static delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });
      if (!user) {
        return res.status(401).json(RecipeView.error('User not found'));
      }

      const recipesRepository = getRepository(Recipe);
      const recipe = await recipesRepository.findOne({ where: { id } });
      if (!recipe) {
        return res.status(401).json(RecipeView.error('Recipe not found'));
      }

      if (recipe.user.id !== req.userId) {
        return res
          .status(401)
          .json(RecipeView.error('You can only delete your own recipes'));
      }

      await fs
        .unlink(path.resolve(__dirname, '..', '..', 'uploads', recipe.imageUrl))
        .catch(err => res.status(401).json(RecipeView.error(err.message)));

      await recipesRepository.delete({ id: recipe.id });
      return res.status(204).json();
    } catch (err) {
      return res.status(401).json(RecipeView.error(err.message));
    }
  };
}
