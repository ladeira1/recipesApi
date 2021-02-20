import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import * as Yup from 'yup';

import User from '../entities/User';
import Recipe from '../entities/Recipe';
import RecipeView from '../views/RecipeView';
import StepController from './StepController';

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
    const response = await getConnection().transaction(async entityManager => {
      try {
        // const usersRepository = getRepository(User);
        const user = await entityManager.findOne(User, {
          where: { id: req.userId },
        });

        const recipe = entityManager.create(Recipe, {
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

        await entityManager.save(recipe);

        // create steps
        const createdSteps = await StepController.createSteps(
          steps,
          recipe,
          entityManager,
        );

        if ('error' in createdSteps) {
          return res.status(400).json(RecipeView.error(createdSteps.error));
        }

        return res.status(201).json(RecipeView.render(recipe, createdSteps));
      } catch (err) {
        return res.status(400).json(RecipeView.error(String(err.message)));
      }
    });

    return response;
  };
}
