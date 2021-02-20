module.exports = [
  {
    name: 'test',
    type: 'sqlite',
    database: './__tests__/database/database.sqlite',
    synchronize: true,
    migrations: ['src/database/migrations/*.ts'],
    entities: ['src/entities/*.ts'],
    cli: {
      migrationsDir: './src/database/migrations',
      entitiesDir: 'src/entities',
    },
  },
  {
    name: 'development',
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    migrations: ['src/database/migrations/*.ts'],
    entities: ['src/entities/*.ts'],
    cli: {
      migrationsDir: './src/database/migrations',
      entitiesDir: 'src/entities',
    },
  },
];
