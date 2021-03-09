import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/upload';

import UserController from './controllers/UserController';
import RecipeController from './controllers/RecipeController';
import UserRatingController from './controllers/UserRatingController';
import ReviewController from './controllers/ReviewController';
import FavoriteController from './controllers/FavoriteController';

import authMiddleware from './middlewares/auth';
import adminMiddleware from './middlewares/admin';
import AdminController from './controllers/AdminController';

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

// admin
routes.put('/user/admin', adminMiddleware, AdminController.create);
routes.put('/user/admin/remove', adminMiddleware, AdminController.delete);

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
routes.get('/rating/:id', authMiddleware, UserRatingController.index);
routes.post('/rating', authMiddleware, UserRatingController.create);
routes.put('/rating', authMiddleware, UserRatingController.update);
routes.delete('/rating/:id', authMiddleware, UserRatingController.delete);

// review a recipe
routes.get('/recipe/review/:id', ReviewController.index);
routes.get('/recipe/review/:id/:page/:limit', ReviewController.getMany);
routes.post('/recipe/review', authMiddleware, ReviewController.create);
routes.put('/recipe/review', authMiddleware, ReviewController.update);
routes.delete('/recipe/review/:id', authMiddleware, ReviewController.delete);

// favorite a recipe
routes.get(
  '/recipe/favorite/:page/:limit',
  authMiddleware,
  FavoriteController.getMany,
);
routes.post('/recipe/favorite', authMiddleware, FavoriteController.create);
routes.delete(
  '/recipe/favorite/:id',
  authMiddleware,
  FavoriteController.delete,
);
export default routes;
