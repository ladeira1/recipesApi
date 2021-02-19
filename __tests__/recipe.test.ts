import request from 'supertest';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';

describe('Testing Recipe', () => {
  let token: string;

  beforeAll(async done => {
    await createTypeormConnection();
    await connection.clear();
    done();
  });

  beforeEach(async () => {
    await connection.clear();
    const response = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  it('should create recipe', async done => {
    const response = await request(app)
      .post('/recipe')
      .send({
        name: 'test recipe',
        imageUrl: null,
        description: 'test description',
        ingredients: 'ingredient 1, ingredient 2, ingredient 3',
        preparationTime: 40,
        serves: 2,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(201);
    done();
  });

  it('should not create recipe when token is not valid', async done => {
    const response = await request(app).post('/recipe').send({
      name: 'test recipe',
      imageUrl: null,
      description: 'test description',
      ingredients: 'ingredient 1, ingredient 2, ingredient 3',
      preparationTime: 40,
      serves: 2,
    });

    expect(response.status).toEqual(400);
    expect(response.text).toContain('Token not found');
    done();
  });

  it('should not create recipe when data is missing', async done => {
    const response = await request(app)
      .post('/recipe')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(401);
    expect(response.text).toContain(
      '[{"error":"Recipe name has not been informed"},{"error":"Description has not been informed"},{"error":"Ingredients have not been informed"},{"error":"Preparation time must be informed"},{"error":"The amount of people it serves must be informed"}]',
    );
    done();
  });
});
