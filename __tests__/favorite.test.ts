import request from 'supertest';

import UserRating from '../src/models/UserRating';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';

import User from '../src/models/User';
import Recipe from '../src/models/Recipe';

jest.setTimeout(30000);

describe('Testing create Favorite', () => {
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
    await connection.clear(UserRating);

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
    setTimeout(() => done(), 3000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should favorite a recipe', async done => {
    const response = await request(app)
      .post('/recipe/favorite')
      .send({ recipeId })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.text).toContain('id');
    expect(response.text).toContain('createdAt');
    expect(response.text).toContain(recipeId);
    done();
  });

  it('should not favorite a recipe when no id is sent', async done => {
    const response = await request(app)
      .post('/recipe/favorite')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Recipe must be informed');
    done();
  });

  it('should not favorite a recipe when no token is sent', async done => {
    const response = await request(app).post('/recipe/favorite');

    expect(response.status).toBe(400);
    expect(response.text).toContain('Token not found');
    done();
  });
});

describe('Testing get Favorite', () => {
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
    await connection.clear(UserRating);

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
    setTimeout(async () => {
      await request(app)
        .post('/recipe/favorite')
        .send({ recipeId })
        .set('Authorization', `Bearer ${token}`);

      done();
    }, 3000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should get users favorites recipes', async done => {
    const response = await request(app)
      .get('/recipe/favorite/1/5')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toContain(recipeId);
    expect(response.text).toContain('id');
    expect(response.text).toContain('createdAt');
    done();
  });

  it('should not get users favorites recipes when no page or limit is sent', async done => {
    const response = await request(app)
      .get('/recipe/favorite/')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('invalid input syntax for integer');
    done();
  });

  it('should not get users favorites recipes when no token is sent', async done => {
    const response = await request(app).get('/recipe/favorite/1/5');

    expect(response.status).toBe(400);
    expect(response.text).toContain('Token not foun');
    done();
  });
});

describe('Testing update Favorite', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;
  let favoriteId: number;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);
    await connection.clear(UserRating);

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
    setTimeout(async () => {
      const response = await request(app)
        .post('/recipe/favorite')
        .send({ recipeId })
        .set('Authorization', `Bearer ${token}`);

      favoriteId = response.body.id;
      done();
    }, 3000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should delete users favorite recipe', async done => {
    const response = await request(app)
      .delete(`/recipe/favorite/${favoriteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    done();
  });

  it('should not delete users favorite recipe when id is invalid', async done => {
    const response = await request(app)
      .delete(`/recipe/favorite/-21312`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Favorite recipe not found');
    done();
  });

  it('should not delete users favorite recipe when no token is sent', async done => {
    const response = await request(app).delete(
      `/recipe/favorite/${favoriteId}`,
    );

    expect(response.status).toBe(400);
    expect(response.text).toContain('Token not found');
    done();
  });
});
