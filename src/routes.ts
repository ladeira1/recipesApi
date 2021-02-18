import { Router } from 'express';

import UserController from './controllers/UserController';

import authMiddleware from './middlewares/auth';

const routes = Router();

routes.post('/user', UserController.create);
routes.post('/user/auth', UserController.login);
routes.delete('/user', authMiddleware, UserController.delete);
routes.put('/user', authMiddleware, UserController.update);

export default routes;
