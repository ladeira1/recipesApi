import express from 'express';
import cors from 'cors';
import path from 'path';
import connection from './database/connection';

import routes from './routes';

connection.create();

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

export default app;
