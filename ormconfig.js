module.exports = [
  {
    name: 'test',
    type: 'postgres',
    url: process.env.TEST_DATABASE_URL,
    database: './__tests__/database/database.sqlite',
    synchronize: true,
    migrations: ['src/database/migrations/*.ts'],
    entities: ['src/models/*.ts'],
    cli: {
      migrationsDir: './src/database/migrations',
      entitiesDir: 'src/models',
    },
  },
  {
    name: 'development',
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    migrations: ['src/database/migrations/*.ts'],
    entities: ['src/models/*.ts'],
    cli: {
      migrationsDir: './src/database/migrations',
      entitiesDir: 'src/models',
    },
  },
];
