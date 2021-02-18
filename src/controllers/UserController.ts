import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import User from '../entities/User';
import UserView from '../views/UserView';

import getToken from '../utils/getToken';

export default class UserController {
  static create = async (req: Request, res: Response): Promise<Response> => {
    // image will be added in the future
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

      return res.status(422).json(UserView.manyErrors(validation));
    }

    // create user
    const usersRepository = getRepository(User);
    try {
      const user = usersRepository.create({
        name,
        email,
        password,
      });

      user.hashPassword();
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

      return res.status(422).json(UserView.manyErrors(validation));
    }

    // login
    const usersRepository = getRepository(User);

    try {
      const user = await usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(401).json('Account not found');
      }

      if (!user.validatePassword(password)) {
        return res.status(401).json('Invalid password');
      }

      return res
        .status(200)
        .json(UserView.renderToken(user, getToken(user.id)));
    } catch (err) {
      return res.status(400).json(UserView.error(err.message));
    }
  };
}
