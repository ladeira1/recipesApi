import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/upload';

import UserController from './controllers/UserController';
import RecipeController from './controllers/RecipeController';

import authMiddleware from './middlewares/auth';

const routes = Router();
const upload = multer(uploadConfig);

// user
routes.get('/user/:id', UserController.index);
routes.post('/user', UserController.create);
routes.post('/user/auth', UserController.login);
routes.delete('/user', authMiddleware, UserController.delete);
routes.put(
  '/user',
  authMiddleware,
  upload.single('image'),
  UserController.update,
);

// recipe
routes.get('/recipe/:id', RecipeController.index);
routes.post(
  '/recipe',
  authMiddleware,
  upload.single('image'),
  RecipeController.create,
);

export default routes;
