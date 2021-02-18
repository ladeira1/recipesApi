import express from 'express';
import cors from 'cors';
import connection from './database/connection';

import routes from './routes';

connection.create();

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

export default app;
