import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';
import path from 'path';
import { fs } from 'mz';
import User from '../entities/User';
import UserView from '../views/UserView';

import getToken from '../utils/getToken';

export default class UserController {
  static create = async (req: Request, res: Response): Promise<Response> => {
    // image will be added in the update
    const { name, email, password, passwordConfirmation } = req.body;
    const schema = Yup.object().shape({
      name: Yup.string().required('Name has not been informed'),
      email: Yup.string().email().required('E-mail has not been informed'),
      password: Yup.string()
        .required('Password has not been informed')
        .min(6, 'Invalid password'),
      passwordConfirmation: Yup.string()
        .required('Password confirmation has not been informed')
        .min(6, 'Invalid password')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
    });

    // validate request data
    const validationValues = { name, email, password, passwordConfirmation };
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

      return res.status(401).json(UserView.manyErrors(validation));
    }

    // create user
    try {
      const usersRepository = getRepository(User);
      const user = usersRepository.create({
        name,
        email,
        password,
      });

      user.hashPassword(password);
      await usersRepository.save(user);

      return res
        .status(201)
        .json(UserView.renderToken(user, getToken(user.id)));
    } catch (err) {
      return res.status(400).json(UserView.error(String(err.message)));
    }
  };

  static login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    const schema = Yup.object().shape({
      email: Yup.string().email().required('E-mail has not been informed'),
      password: Yup.string()
        .required('Password has not been informed')
        .min(6, 'Invalid password'),
    });

    // validate request data
    const validationValues = { email, password };
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

      return res.status(401).json(UserView.manyErrors(validation));
    }

    // login
    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(401).json(UserView.error('Account not found'));
      }

      if (!user.validatePassword(password)) {
        return res.status(401).json(UserView.error('Invalid password'));
      }

      return res
        .status(200)
        .json(UserView.renderToken(user, getToken(user.id)));
    } catch (err) {
      return res.status(400).json(UserView.error(err.message));
    }
  };

  static delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ id: req.userId });

      if (user && user.profileImageUrl) {
        await fs
          .unlink(
            path.resolve(
              __dirname,
              '..',
              '..',
              'uploads',
              user.profileImageUrl,
            ),
          )
          .catch(err => res.status(401).json(UserView.error(err.message)));
      }
      await usersRepository.delete({ id: req.userId });

      return res.status(204).json();
    } catch (err) {
      return res.status(401).json(UserView.error(err.message));
    }
  };

  static update = async (req: Request, res: Response): Promise<Response> => {
    const { name, password, passwordConfirmation } = req.body;
    const image = req.file;

    const schema = Yup.object().shape({
      name: Yup.string(),
      password: Yup.string()
        .required('Password has not been informed')
        .min(6, 'Invalid password'),
      passwordConfirmation: Yup.string()
        .required('Password confirmation has not been informed')
        .min(6, 'Invalid password')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
      image: Yup.mixed().test('fileSize', 'The file is too large', value => {
        if (value === undefined) return true;
        if (!value.length) return true;
        return value[0].size <= 2000000;
      }),
    });

    // validate request data
    const validationValues = { name, password, passwordConfirmation, image };
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

      return res.status(401).json(UserView.manyErrors(validation));
    }

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id: req.userId } });

      if (!user) {
        return res.status(401).json(UserView.error('Account not found'));
      }

      user.name = name;
      user.hashPassword(password);
      user.profileImageUrl = image ? image.filename : undefined;

      await usersRepository.save(user);
      return res
        .status(200)
        .json(UserView.renderToken(user, getToken(user.id)));
    } catch (err) {
      return res.status(401).json(UserView.error(err.message));
    }
  };

  static index = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(401).json(UserView.error('User not found'));
      }

      return res.status(200).json(UserView.render(user));
    } catch (err) {
      return res.status(401).json(UserView.error(err.message));
    }
  };
}
