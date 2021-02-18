import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';

const getToken = (id: string): string => {
  return jwt.sign({ id }, authConfig.secret, {
    expiresIn: authConfig.expiresIn,
  });
};

export default getToken;
