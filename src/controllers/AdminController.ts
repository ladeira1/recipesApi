import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';
import User from '../models/User';
import UserView from '../views/UserView';

export default class AdminController {
  static create = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.body;

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id } });
      if (!user) {
        return res.status(400).json(UserView.error('User not found'));
      }

      if (user.isAdmin) {
        return res.status(400).json(UserView.error('User is already an admin'));
      }

      user.isAdmin = true;
      await usersRepository.save(user);
      return res.status(200).json(UserView.renderAdmin(user));
    } catch (err) {
      return res.status(400).json(UserView.error(err.message));
    }
  };

  static delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.body;

    try {
      const usersRepository = getRepository(User);
      const user = await usersRepository.findOne({ where: { id } });
      if (!user) {
        return res.status(400).json(UserView.error('User not found'));
      }

      if (!user.isAdmin) {
        return res.status(400).json(UserView.error('User is not an admin'));
      }

      user.isAdmin = false;
      await usersRepository.save(user);
      return res.status(200).json(UserView.renderAdmin(user));
    } catch (err) {
      return res.status(400).json(UserView.error(err.message));
    }
  };
}
