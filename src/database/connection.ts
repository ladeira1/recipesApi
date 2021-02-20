import { EntityTarget, getConnection } from 'typeorm';
import createTypeormConnection from '../utils/createTypeormConnection';

import User from '../entities/User';
import Recipe from '../entities/Recipe';
import Step from '../entities/Step';

type ClearType = User | Recipe | Step;

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
