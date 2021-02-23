/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { promisify } from 'util';

import authConfig from '../config/auth';

const authMiddleware = async (
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

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;
