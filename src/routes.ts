import { Router } from 'express';

import UserController from './controllers/UserController';

const routes = Router();

routes.post('/user/', UserController.create);
routes.post('/user/auth', UserController.login);

export default routes;
