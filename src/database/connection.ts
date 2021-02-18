import { getConnection, getRepository } from 'typeorm';
import createTypeormConnection from '../utils/createTypeormConnection';

const connection = {
  async create(): Promise<void> {
    await createTypeormConnection();
  },

  async close(): Promise<void> {
    await getConnection().close();
  },

  async clear(): Promise<void> {
    const entities = getConnection().entityMetadatas;
    entities.forEach(async entity => {
      const repository = getConnection().getRepository(entity.name); // Get repository
      await repository.clear(); // Clear each entity table's
    });
  },
};
export default connection;
