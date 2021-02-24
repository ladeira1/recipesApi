import { EntityTarget, getConnection } from 'typeorm';
import createTypeormConnection from '../utils/createTypeormConnection';

import User from '../models/User';
import Recipe from '../models/Recipe';
import UserRating from '../models/UserRating';
import Review from '../models/Review';

type ClearType = User | Recipe | UserRating | Review;

const connection = {
  async create(): Promise<void> {
    await createTypeormConnection();
  },

  async close(): Promise<void> {
    await getConnection().close();
  },

  async clear(table: EntityTarget<ClearType>): Promise<void> {
    await getConnection().createQueryBuilder().delete().from(table).execute();
  },
};

export default connection;
