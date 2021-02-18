import { getConnectionOptions, createConnection, Connection } from 'typeorm';

const createTypeormConnection = async (): Promise<Connection> => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({ ...connectionOptions, name: 'default' });
};

export default createTypeormConnection;
