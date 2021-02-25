import request from 'supertest';

import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';

import User from '../src/models/User';
import Recipe from '../src/models/Recipe';
import Review from '../src/models/Review';

describe('Testing create Review', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let creatorToken: string;
  let reviewToken: string;
  let recipeId: number;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);
    await connection.clear(Review);

    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    creatorToken = userResponse.body.token;

    const reviewUserResponse = await request(app).post('/user').send({
      name: 'ratingUser',
      email: 'rating@user.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    reviewToken = reviewUserResponse.body.token;

    const recipeResponse = await request(app)
      .post('/recipe')
      .field('name', 'test recipe')
      .field('description', 'test description')
      .field('ingredients', 'ingredient 1, ingredient 2, ingredient 3')
      .field('preparationTime', 40)
      .field('serves', 2)
      .field('steps', 'first step, second step, third last, last step')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${creatorToken}`);

    recipeId = recipeResponse.body.id;
    // forcing it to wait until transaction is done
    setTimeout(() => done(), 3000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should create a review', async done => {
    const response = await request(app)
      .post('/recipe/review')
      .send({
        recipeId,
        content: 'no creativity here',
      })
      .set('Authorization', `Bearer ${reviewToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      content: 'no creativity here',
      recipeId,
    });
    done();
  });

  it('should not create a review on a recipe created by yourself', async done => {
    const response = await request(app)
      .post('/recipe/review')
      .send({
        recipeId,
        content: 'no creativity here',
      })
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'You cannot review your own recipe',
    });
    done();
  });

  it('should not create a review when no data is sent', async done => {
    const response = await request(app)
      .post('/recipe/review')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Recipe must be informed');
    expect(response.text).toContain('Review content must be informed');
    done();
  });

  it('should not create a review when no token is sent', async done => {
    const response = await request(app).post('/recipe/review').send({
      recipeId,
      content: 'no creativity here',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Token not found' });
    done();
  });
});

jest.setTimeout(30000);

describe('Testing get Review', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let review: any;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);
    await connection.clear(Review);

    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = userResponse.body.token;

    const reviewUserResponse = await request(app).post('/user').send({
      name: 'ratingUser',
      email: 'rating@user.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

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
        .post('/recipe/review')
        .send({
          recipeId,
          content: 'no creativity here',
        })
        .set('Authorization', `Bearer ${reviewUserResponse.body.token}`);

      review = response.body;
      done();
    }, 3000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should get a Review', async done => {
    const response = await request(app).get(`/recipe/review/${review.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      content: review.content,
      id: review.id,
      recipeId: review.recipeId,
      user: {
        id: review.user.id,
        name: review.user.name,
        image: review.user.profileImageUrl || null,
      },
    });
    done();
  });

  it('should not get a Review when no id is sent', async done => {
    const response = await request(app).get('/recipe/review/');

    expect(response.status).toBe(401);
    done();
  });

  it('should not get a Review when an invalid id is sent', async done => {
    const response = await request(app).get('/recipe/review/-23132');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Review not found' });
    done();
  });

  it('should get the reviews related to a Recipe', async done => {
    const response = await request(app).get(`/recipe/review/${review.id}/1/5`);

    expect(response.status).toBe(200);
    expect(response.text).toContain(`${recipeId}`);
    expect(response.text).toContain(`${review.id}`);
    expect(response.text).toContain(`${review.user.id}`);
    done();
  });

  it('should not get the reviews when the recipe id is invalid', async done => {
    const response = await request(app).get(`/recipe/review/-2132132/1/5`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Review not found');
    done();
  });
});

describe('Testing update Review', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let review: any;
  let reviewUserToken: string;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);
    await connection.clear(Review);

    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = userResponse.body.token;

    const reviewUserResponse = await request(app).post('/user').send({
      name: 'ratingUser',
      email: 'rating@user.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    reviewUserToken = reviewUserResponse.body.token;

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
        .post('/recipe/review')
        .send({
          recipeId,
          content: 'no creativity here',
        })
        .set('Authorization', `Bearer ${reviewUserResponse.body.token}`);

      review = response.body;
      done();
    }, 3000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should update a review', async done => {
    const response = await request(app)
      .put('/recipe/review')
      .send({
        id: review.id,
        content: 'theres still no creativity here',
      })
      .set('Authorization', `Bearer ${reviewUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      content: 'theres still no creativity here',
    });
    done();
  });

  it('should not update a review when content is not sent', async done => {
    const response = await request(app)
      .put('/recipe/review')
      .set('Authorization', `Bearer ${reviewUserToken}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Review content must be informed');
    expect(response.text).toContain('Review must be informed');
    done();
  });

  it('should not updat a review when token is not sent', async done => {
    const response = await request(app).put('/recipe/review').send({
      id: review.id,
      content: 'theres still no creativity here',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Token not found' });
    done();
  });
});

describe('Testing delete Review', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  let token: string;
  let recipeId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let review: any;
  let reviewUserToken: string;

  beforeAll(async done => {
    await createTypeormConnection();
    done();
  });

  beforeEach(async done => {
    await connection.clear(User);
    await connection.clear(Recipe);
    await connection.clear(Review);

    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = userResponse.body.token;

    const reviewUserResponse = await request(app).post('/user').send({
      name: 'ratingUser',
      email: 'rating@user.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    reviewUserToken = reviewUserResponse.body.token;

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
        .post('/recipe/review')
        .send({
          recipeId,
          content: 'no creativity here',
        })
        .set('Authorization', `Bearer ${reviewUserResponse.body.token}`);

      review = response.body;
      done();
    }, 3000);
  });

  afterAll(async done => {
    await connection.close();
    done();
  });

  it('should delete review', async done => {
    const response = await request(app)
      .delete(`/recipe/review/${review.id}`)
      .set('Authorization', `Bearer ${reviewUserToken}`);

    expect(response.status).toBe(204);
    done();
  });

  it('should not delete a review when id is invalid', async done => {
    const response = await request(app)
      .delete(`/recipe/review/-12312412`)
      .set('Authorization', `Bearer ${reviewUserToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Review not found' });
    done();
  });

  it('should not delete a review when ino token in sent', async done => {
    const response = await request(app).delete(`/recipe/review/${review.id}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Token not found' });
    done();
  });
});
