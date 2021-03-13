import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import * as Yup from 'yup';
import CategoryView from '../views/CategoryView';
import Category from '../models/Category';

import Review from '../models/Review';
import User from '../models/User';
import ReviewView from '../views/ReviewView';

export default class CategoryController {
  static create = async (req: Request, res: Response): Promise<Response> => {
    const { name } = req.body;
    const image = req.file;

    const schema = Yup.object().shape({
      name: Yup.string().required('Name must be informed'),
      image: Yup.mixed()
        .required('Image must be informed')
        .test('fileSize', 'The file is too large', value => {
          if (value === undefined) return false;
          if (!value.length) return true;
          return value[0].size <= 2000000;
        }),
    });

    // validate request data
    const validationValues = { name, image };

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

      return res.status(401).json(CategoryView.manyErrors(validation));
    }

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });

      if (!user) {
        return res.status(401).json(CategoryView.error('User not found'));
      }

      const categoriesRepository = getRepository(Category);
      const category = await categoriesRepository.create({
        name,
        imageUrl: image.filename,
      });

      await categoriesRepository.save(category);
      return res.status(201).json(CategoryView.render(category));
    } catch (err) {
      return res.status(401).json(CategoryView.error(err.message));
    }
  };

  static index = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    try {
      const reviewsRepository = getRepository(Review);
      const review = await reviewsRepository.findOne({ where: { id } });

      if (!review) {
        return res.status(401).json(ReviewView.error('Review not found'));
      }

      return res.status(200).json(ReviewView.render(review));
    } catch (err) {
      return res.status(401).json(ReviewView.error(err.message));
    }
  };

  static getMany = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
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

      return res.status(401).json(ReviewView.manyErrors(validation));
    }

    try {
      const startIndex = (page - 1) * limit;
      const reviewsRepository = getRepository(Review);
      const reviews = await reviewsRepository.find({
        where: { id },
        order: { createdAt: 'ASC', id: 'ASC' },
        skip: startIndex,
        take: limit,
      });

      if (!reviews || reviews.length === 0) {
        return res.status(401).json(ReviewView.error('Review not found'));
      }

      if (reviews.length < limit) {
        return res
          .status(200)
          .json(ReviewView.renderMany(reviews, null, limit));
      }

      return res
        .status(200)
        .json(ReviewView.renderMany(reviews, page + 1, limit));
    } catch (err) {
      return res.status(401).json(ReviewView.error(err.message));
    }
  };

  static update = async (req: Request, res: Response): Promise<Response> => {
    const { id, content } = req.body;

    const schema = Yup.object().shape({
      id: Yup.number().required('Review must be informed'),
      content: Yup.string().required('Review content must be informed'),
    });

    // validate request data
    const validationValues = { id, content };

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

      return res.status(401).json(ReviewView.manyErrors(validation));
    }

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });

      if (!user) {
        return res.status(401).json(ReviewView.error('User not found'));
      }

      const reviewsRepository = getRepository(Review);
      const review = await reviewsRepository.findOne({
        where: { user, id },
      });

      if (!review) {
        return res.status(401).json(ReviewView.error('Review not found'));
      }

      review.content = content;

      await reviewsRepository.save(review);
      return res.status(200).json(ReviewView.render(review));
    } catch (err) {
      return res.status(401).json(ReviewView.error(err.message));
    }
  };

  static delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });

      if (!user) {
        return res.status(401).json(ReviewView.error('User not found'));
      }

      const reviewsRepository = getRepository(Review);
      const review = await reviewsRepository.findOne({ where: { id } });

      if (!review) {
        return res.status(401).json(ReviewView.error('Review not found'));
      }

      await reviewsRepository.delete(review);
      return res.status(204).json();
    } catch (err) {
      return res.status(401).json(ReviewView.error(err.message));
    }
  };
}
