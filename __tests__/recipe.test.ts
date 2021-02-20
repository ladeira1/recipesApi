import request from 'supertest';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';

import User from '../src/entities/User';
import Recipe from '../src/entities/Recipe';

describe('Testing Recipe', () => {
  let token: string;
  const filePath = `${__dirname}/test-image/test.jpg`;

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    await connection.clear(Recipe);

    const response = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create recipe', async () => {
    const response = await request(app)
      .post('/recipe')
      .field('name', 'test recipe')
      .field('description', 'test description')
      .field('ingredients', 'ingredient 1, ingredient 2, ingredient 3')
      .field('preparationTime', 40)
      .field('serves', 2)
      .field('steps', 'first step')
      .field('steps', 'second step')
      .field('steps', 'third step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(201);
  });

  it('should not create recipe when token is not valid', async () => {
    const response = await request(app)
      .post('/recipe')
      .field('name', 'test recipe')
      .field('description', 'test description')
      .field('ingredients', 'ingredient 1, ingredient 2, ingredient 3')
      .field('preparationTime', 40)
      .field('serves', 2)
      .field('steps', 'first step')
      .field('steps', 'second step')
      .field('steps', 'third step')
      .attach('image', filePath);

    expect(response.status).toEqual(400);
    expect(response.text).toContain('Token not found');
  });

  it('should not create recipe when data is missing', async () => {
    const response = await request(app)
      .post('/recipe')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(401);
    expect(response.text).toContain(
      '[{"error":"Recipe name has not been informed"},{"error":"image is a required field"},{"error":"The file is too large"},{"error":"Description has not been informed"},{"error":"Ingredients have not been informed"},{"error":"Preparation time must be informed"},{"error":"The amount of people it serves must be informed"},{"error":"Steps have not been informed"}]',
    );
  });
});
