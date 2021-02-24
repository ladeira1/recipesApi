import request from 'supertest';

import UserRating from '../src/models/UserRating';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';

import User from '../src/models/User';
import Recipe from '../src/models/Recipe';

jest.setTimeout(30000);

describe('Testing create UserRating', () => {
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

  it('should rate a recipe', async done => {
    const response = await request(app)
      .post('/rating')
      .send({ recipeId, rating: 3 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      rating: 3,
      recipeId,
    });
    done();
  });

  it('should update an existing rate mean when another one is created', async done => {
    const secondUser = await request(app).post('/user').send({
      name: 'second',
      email: 'second@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    await request(app)
      .post('/rating')
      .send({ recipeId, rating: 3 })
      .set('Authorization', `Bearer ${token}`);

    // forcing it to wait until transacation is finished
    setTimeout(async () => {
      const response = await request(app)
        .post('/rating')
        .send({ recipeId, rating: 5 })
        .set('Authorization', `Bearer ${secondUser.body.token}`);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        rating: 5,
        recipeId,
      });

      setTimeout(async () => {
        const recipeResponse = await request(app).get(`/recipe/${recipeId}`);

        expect(recipeResponse.status).toBe(200);
        expect(recipeResponse.body.rating).toBe(4);
        done();
      }, 3000);
    }, 3000);
  });

  it('should not rate a recipe when rating is higher than 5', async done => {
    const response = await request(app)
      .post('/rating')
      .send({ recipeId, rating: 5.1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Rate must not be higher than 5');
    done();
  });

  it('should not rate a recipe when rating is lower than 0', async done => {
    const response = await request(app)
      .post('/rating')
      .send({ recipeId, rating: -0.1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Rate must be at least 0');
    done();
  });

  it('should not rate a recipe when no recipe is sent', async done => {
    const response = await request(app)
      .post('/rating')
      .send({ rating: 2 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Recipe must be informed');
    done();
  });

  it('should not rate a recipe when no token is sent', async done => {
    const response = await request(app)
      .post('/rating')
      .send({ recipeId, rating: 2 });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Token not found');
    done();
  });
});

describe('Testing get UserRating', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;
  let ratingId: number;

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
      const ratingResponse = await request(app)
        .post('/rating')
        .send({ recipeId, rating: 3 })
        .set('Authorization', `Bearer ${token}`);

      setTimeout(() => {
        ratingId = ratingResponse.body.id;
        done();
      }, 2000);
    }, 2000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should get a rating', async done => {
    const response = await request(app)
      .get(`/rating/${ratingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      recipeId,
      rating: '3',
    });
    done();
  });

  it('should not get a rating when no id is sent', async done => {
    const response = await request(app)
      .get(`/rating`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({});
    done();
  });

  it('should not get a rating when an invalid id is sent', async done => {
    const response = await request(app)
      .get('/rating/-4412')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Rating not found' });
    done();
  });
});

describe('Testing update UserRating', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;
  let ratingId: number;

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
      const ratingResponse = await request(app)
        .post('/rating')
        .send({ recipeId, rating: 3 })
        .set('Authorization', `Bearer ${token}`);

      ratingId = ratingResponse.body.id;

      setTimeout(async () => {
        done();
      }, 1000);
    }, 1000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should update rating', async done => {
    const response = await request(app)
      .put('/rating')
      .send({
        id: ratingId,
        recipeId,
        rating: 5,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ rating: 5, recipeId });

    setTimeout(async () => {
      const recipeResult = await request(app).get(`/recipe/${recipeId}`);

      expect(recipeResult.status).toBe(200);
      expect(recipeResult.body).toMatchObject({ rating: 5 });
      done();
    }, 1000);
  });

  it('should not update rating when data is missing', async done => {
    const response = await request(app)
      .put('/rating')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Rating must be informed');
    expect(response.text).toContain('Recipe must be informed');
    done();
  });
});

describe('Testing delete UserRating', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;
  let ratingId: number;

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
      const ratingResponse = await request(app)
        .post('/rating')
        .send({ recipeId, rating: 3 })
        .set('Authorization', `Bearer ${token}`);

      setTimeout(async () => {
        ratingId = ratingResponse.body.id;
        done();
      }, 4000);
    }, 4000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should delete rating', async done => {
    const response = await request(app)
      .delete(`/rating/${ratingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    setTimeout(async () => {
      const recipeResult = await request(app).get(`/recipe/${recipeId}`);

      expect(recipeResult.status).toBe(200);
      expect(recipeResult.body).toMatchObject({ rating: 0 });
      done();
    }, 1000);
  });

  it('should not delete rating when id is invalid', async done => {
    const response = await request(app)
      .delete(`/rating/-32321`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Rating not found' });
    done();
  });
});
