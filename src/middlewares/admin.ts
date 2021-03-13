import { getRepository } from 'typeorm';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import authConfig from '../config/auth';

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({ error: 'Token not found' });
  }

  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer') {
    return res.status(401).json({ error: 'Token does not match Bearer' });
  }

  try {
    const decoded: any = jwt.verify(
      token,
      authConfig.secret,
      (err, verifiedJwt) => {
        return err ? new Error('Invalid token') : verifiedJwt;
      },
    );
    req.userId = decoded.id;

    const usersRepository = getRepository(User);
    const user = await usersRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isAdmin) {
      return res
        .status(401)
        .json({ error: 'Only an admin can perform this action' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default adminMiddleware;
