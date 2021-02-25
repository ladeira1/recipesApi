import request from 'supertest';

import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';

import User from '../src/models/User';
import Recipe from '../src/models/Recipe';

describe('Testing create Recipe', () => {
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
      .field('steps', 'first step, second step, third last, last step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(201);
    expect(response.body).toMatchObject({
      name: 'test recipe',
      description: 'test description',
      ingredients: 'ingredient 1, ingredient 2, ingredient 3',
      preparationTime: '40',
      serves: '2',
      rating: 0,
      user: {
        name: 'joao',
        imageUrl: null,
      },
    });
  });

  it('should not create recipe when data is missing', async () => {
    const response = await request(app)
      .post('/recipe')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(401);
    expect(response.text).toContain(
      '[{"error":"Recipe name must be informed"},{"error":"Image must be added"},{"error":"The file is too large"},{"error":"Description must be informed"},{"error":"Ingredients must be informed"},{"error":"Preparation time must be informed"},{"error":"The amount of people it serves must be informed"},{"error":"Steps must be informed"}]',
    );
  });

  it('should not create recipe when token is missing', async () => {
    const response = await request(app)
      .post('/recipe')
      .field('name', 'test recipe')
      .field('description', 'test description')
      .field('ingredients', 'ingredient 1, ingredient 2, ingredient 3')
      .field('preparationTime', 40)
      .field('serves', 2)
      .field('steps', 'first step, second step, third last, last step')
      .attach('image', filePath);

    expect(response.status).toEqual(400);
    expect(response.text).toContain('Token not found');
  });
});

jest.setTimeout(30000);

describe('Testing get Recipe', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);

    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = userResponse.body.token;

    const recipeResponse = await request(app)
      .post('/recipe')
      .field('name', 'test recipe')
      .field('description', 'test description')
      .field('ingredients', 'ingredient 1, ingredient 2, ingredient 3')
      .field('preparationTime', 40)
      .field('serves', 2)
      .field('steps', 'first step, second step, third last, last step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    recipeId = recipeResponse.body.id;
    // forcing it to wait until transaction is done
    setTimeout(() => done(), 1500);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should get the newest recipes', async done => {
    const response = await request(app).get('/recipe/recent/1/5');

    expect(response.status).toBe(200);
    expect(response.text).toContain('test recipe');
    done();
  });

  it('should not get a recipe if an invalid id is passed', async done => {
    const response = await request(app).get('/recipe/-3-');
    expect(response.status).toBe(401);
    done();
  });

  it('should get top recipes', async done => {
    const response = await request(app).get('/recipe/top/1/5');

    expect(response.status).toBe(200);
    expect(response.text).toContain('test recipe');
    done();
  });

  it('should get a recipe', async done => {
    const response = await request(app).get(`/recipe/${recipeId}`);

    expect(response.status).toBe(200);
    expect(response.text).toContain('test recipe');
    expect(response.text).toContain('ingredient 1, ingredient 2, ingredient 3');
    expect(response.text).toContain(
      'first step, second step, third last, last step',
    );
    done();
  });

  it('shouldnt get recipes when no page or limit has been informed', async done => {
    const response = await request(app).get('/recipe/top');

    expect(response.status).toBe(401);
    expect(response.text).toContain('invalid input syntax');
    done();
  });

  it('should get recipes by name', async () => {
    const response = await request(app)
      .get('/recipe/name/1/5')
      .send({ name: 'recipe' });

    expect(response.status).toBe(200);
    expect(response.text).toContain('test recipe');
  });
});

describe('testing delete Recipe', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);

    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = userResponse.body.token;

    const recipeResponse = await request(app)
      .post('/recipe')
      .field('name', 'test recipe')
      .field('description', 'test description')
      .field('ingredients', 'ingredient 1, ingredient 2, ingredient 3')
      .field('preparationTime', 40)
      .field('serves', 2)
      .field('steps', 'first step, second step, third step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    recipeId = recipeResponse.body.id;
    // forcing it to wait until transaction is done
    setTimeout(() => done(), 1500);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should delete recipe', async done => {
    const response = await request(app)
      .delete(`/recipe/${recipeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    done();
  });

  it('should not delete recipe created by another user', async done => {
    const userResponse = await request(app).post('/user').send({
      name: 'joao2',
      email: 'joao2@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app)
      .delete(`/recipe/${recipeId}`)
      .set('Authorization', `Bearer ${userResponse.body.token}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'You can only delete your own recipes',
    });
    done();
  });

  it('should not delete recipe when not authenticated', async done => {
    const response = await request(app).delete(`/recipe/${recipeId}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Token not found' });
    done();
  });

  it('should not delete recipe when id is invalid', async done => {
    const response = await request(app)
      .delete(`/recipe/-332`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Recipe not found' });
    done();
  });
});

describe('testing update Recipe', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);

    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = userResponse.body.token;

    const recipeResponse = await request(app)
      .post('/recipe')
      .field('name', 'test recipe')
      .field('description', 'test description')
      .field('ingredients', 'ingredient 1, ingredient 2, ingredient 3')
      .field('preparationTime', 40)
      .field('serves', 2)
      .field('steps', 'first step, second step, third step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    recipeId = recipeResponse.body.id;
    // forcing it to wait until transaction is done
    setTimeout(() => done(), 1500);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should update recipe', async done => {
    const response = await request(app)
      .put('/recipe')
      .field('id', recipeId)
      .field('name', 'test recipe 2')
      .field('description', 'test description 2')
      .field('ingredients', 'ingredient 2, ingredient 3')
      .field('preparationTime', 10)
      .field('serves', 4)
      .field('steps', 'first step, second step, third last, last step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: 'test recipe 2',
      description: 'test description 2',
      ingredients: 'ingredient 2, ingredient 3',
      preparationTime: 10,
      serves: 4,
      steps: 'first step, second step, third last, last step',
    });
    done();
  });

  it('should not update recipe when id is missing', async done => {
    const response = await request(app)
      .put('/recipe')
      .field('name', 'test recipe 2')
      .field('description', 'test description 2')
      .field('ingredients', 'ingredient 2, ingredient 3')
      .field('preparationTime', 10)
      .field('serves', 4)
      .field('steps', 'first step, second step, third last, last step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Recipe must be informed');
    done();
  });

  it('should not update recipe when token is missing', async done => {
    const response = await request(app)
      .put('/recipe')
      .field('name', 'test recipe 2')
      .field('description', 'test description 2')
      .field('ingredients', 'ingredient 2, ingredient 3')
      .field('preparationTime', 10)
      .field('serves', 4)
      .field('steps', 'first step, second step, third last, last step')
      .attach('image', filePath);

    expect(response.status).toBe(400);
    expect(response.text).toContain('Token not found');
    done();
  });
});
