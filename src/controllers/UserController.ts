import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import User from '../entities/User';
import UserView from '../views/UserView';

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
        .required('Passwords must match')
        .min(6, 'Passwords must match')
        .oneOf([Yup.ref('password')]),
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
            return { message };
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

      return res.status(201).json(UserView.render(user));
    } catch (err) {
      return res.status(409).json(UserView.error('Account already exists'));
    }
  };
}
