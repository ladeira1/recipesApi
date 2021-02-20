import request from 'supertest';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';
import User from '../src/entities/User';

describe('Testing User', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
  });

  afterAll(async () => {
    await connection.close();
  });

  // create account
  it('should create user', async () => {
    const response = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    expect(response.status).toEqual(201);
  });

  it('should not create user when data is invalid', async () => {
    const response = await request(app).post('/user');

    expect(response.status).toEqual(401);
    expect(response.text).toContain(
      '[{"error":"Name has not been informed"},{"error":"E-mail has not been informed"},{"error":"Password confirmation has not been informed"},{"error":"Password has not been informed"}]',
    );
  });

  it('should not create user when passwords dont match', async () => {
    const response = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123124',
    });

    expect(response.status).toEqual(401);
    expect(response.text).toContain('Passwords must match');
  });

  it('should not create another user if email is already taken', async () => {
    await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app).post('/user').send({
      name: 'joao2',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    expect(response.status).toEqual(400);
  });

  // login
  it('should login when account is created', async () => {
    await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app).post('/user/auth').send({
      email: 'joao@test.com',
      password: '123123',
    });

    expect(response.status).toEqual(200);
    expect(response.text).toContain('token');
  });

  it('should not login when account is not created', async () => {
    const response = await request(app).post('/user/auth').send({
      email: 'doesntexist@test.com',
      password: '123123',
    });

    expect(response.status).toEqual(401);
    expect(response.text).toContain('Account not found');
  });

  it('should not login when password is wrong', async () => {
    await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app).post('/user/auth').send({
      email: 'joao@test.com',
      password: '123124',
    });

    expect(response.status).toEqual(401);
    expect(response.text).toContain('Invalid password');
  });

  // delete account
  it('should delete account when authenticated', async () => {
    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${userResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Account successfully deleted');
  });

  it('should not delete account when authenticated', async () => {
    await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer: ${'fails'}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Token does not match Bearer');
  });

  // update account
  it('should update account when authenticated', async () => {
    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app)
      .put('/user')
      .field('name', 'newJoao')
      .field('password', '123123')
      .field('passwordConfirmation', '123123')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${userResponse.body.token}`);

    expect(response.status).toEqual(201);
    expect(response.text).toContain('newJoao');
  });

  it('should not update account when not authenticated', async () => {
    await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app)
      .put('/user')
      .send({
        name: 'newJoao',
        password: '123124',
        passwordConfirmation: '123124',
      })
      .set('Authorization', `Bearer fail`);

    expect(response.status).toEqual(401);
    expect(response.text).toContain('Account not found');
  });

  it('should not update account when passwords dont match', async () => {
    const userResponse = await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const response = await request(app)
      .put('/user')
      .field('name', 'newJoao')
      .field('password', '123123')
      .field('passwordConfirmation', '123124')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${userResponse.body.token}`);

    expect(response.status).toEqual(401);
    expect(response.text).toContain('Passwords must match');
  });

  // get account
  it('should get account when id is valid', async () => {
    await request(app).post('/user').send({
      name: 'joao',
      email: 'joao@test.com',
      password: '123123',
      passwordConfirmation: '123123',
    });

    const userResponse = await request(app).post('/user/auth').send({
      email: 'joao@test.com',
      password: '123123',
    });

    const response = await request(app).get(`/user/${userResponse.body.id}`);
    expect(response.status).toEqual(200);
    expect(response.text).toContain(userResponse.body.id);
    expect(response.text).toContain('joao');
    expect(response.text).toContain('joao@test.com');
  });

  it('should not get account when id is invalid', async () => {
    const response = await request(app).get('/user/sdofdsi');

    expect(response.status).toEqual(401);
  });
});
