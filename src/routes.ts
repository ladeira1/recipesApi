import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/upload';

import UserController from './controllers/UserController';
import RecipeController from './controllers/RecipeController';

import authMiddleware from './middlewares/auth';
import Recipe from './entities/Recipe';
import UserRatingController from './controllers/UserRatingController';
import UserRating from './entities/UserRating';

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
routes.get('/recipe/recent/:page/:limit', RecipeController.getRecent);
routes.get('/recipe/top/:page/:limit', RecipeController.getTopRated);
routes.get('/recipe/name/:page/:limit', RecipeController.getByName);
routes.post(
  '/recipe',
  authMiddleware,
  upload.single('image'),
  RecipeController.create,
);
routes.put(
  '/recipe',
  authMiddleware,
  upload.single('image'),
  RecipeController.update,
);
routes.delete('/recipe/:id', authMiddleware, RecipeController.delete);

// rating a recipe
routes.post('/rating', authMiddleware, UserRatingController.create);
routes.put('/rating', authMiddleware, UserRatingController.update);
routes.delete('/rating/:id', authMiddleware, UserRatingController.delete);

export default routes;
