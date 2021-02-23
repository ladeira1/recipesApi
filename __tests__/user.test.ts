import request from 'supertest';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';
import User from '../src/entities/User';

describe('Testing create User', () => {
  const newUser = {
    name: 'joao',
    email: 'joao@test.com',
    password: '123123',
    passwordConfirmation: '123123',
  };

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create user', async () => {
    const response = await request(app).post('/user').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      imageUrl: null,
    });
  });

  it('should not create user when email is already taken', async () => {
    await request(app).post('/user').send({
      name: 'test',
      email: 'joao@test.com',
      password: '123456',
      passwordConfirmation: '123456',
    });

    const response = await request(app).post('/user').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error:
        'duplicate key value violates unique constraint "UQ_4a257d2c9837248d70640b3e36e"',
    });
  });

  it('should not create user when data is missing', async () => {
    const response = await request(app).post('/user').send();

    expect(response.status).toBe(401);
    expect(response.text).toContain('Name has not been informed');
    expect(response.text).toContain('E-mail has not been informed');
    expect(response.text).toContain('Password has not been informed');
    expect(response.text).toContain(
      'Password confirmation has not been informed',
    );
  });

  it('should not create user when passwords dont match', async () => {
    const response = await request(app)
      .post('/user')
      .send({
        ...newUser,
        passwordConfirmation: '123444',
      });

    expect(response.status).toBe(401);
    expect(response.text).toContain('Passwords must match');
  });
});

describe('Testing login User', () => {
  const newUser = {
    name: 'joao',
    email: 'joao@test.com',
    password: '123123',
    passwordConfirmation: '123123',
  };

  const user = {
    email: 'joao@test.com',
    password: '123123',
  };

  const wrongUser = {
    email: 'joao@test.com',
    password: '123111',
  };

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    await request(app).post('/user').send(newUser);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should login', async () => {
    const response = await request(app).post('/user/auth').send(user);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      imageUrl: null,
    });
  });

  it('should not login when password is wrong', async () => {
    const response = await request(app).post('/user/auth').send(wrongUser);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Invalid password',
    });
  });

  it('should not login when account doesnt exist', async () => {
    const response = await request(app)
      .post('/user/auth')
      .send({
        ...wrongUser,
        email: 'doesntexist@test.com',
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Account not found',
    });
  });
});

describe('Testing delete User', () => {
  const newUser = {
    name: 'joao',
    email: 'joao@test.com',
    password: '123123',
    passwordConfirmation: '123123',
  };
  let token: string;

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    const userResponse = await request(app).post('/user').send(newUser);
    token = userResponse.body.token;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should delete account', async () => {
    const response = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(response.body).toMatchObject({});
  });

  it('should not delete account when no token is sent', async () => {
    const response = await request(app).delete('/user');

    expect(response.status).toBe(400);
    expect(response.text).toContain('Token not found');
  });
});

describe('Testing update User', () => {
  const filePath = `${__dirname}/test-image/test.jpg`;
  const newUser = {
    name: 'joao',
    email: 'joao@test.com',
    password: '123123',
    passwordConfirmation: '123123',
  };
  let token: string;

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    const userResponse = await request(app).post('/user').send(newUser);
    token = userResponse.body.token;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should update user', async () => {
    const response = await request(app)
      .put('/user')
      .field('name', 'newJoao')
      .field('password', '123123')
      .field('passwordConfirmation', '123123')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toContain('newJoao');
    expect(response.text).toContain('http://localhost:3333/uploads/');
    expect(response.text).toContain('-test.jpg');
  });

  it('should not update user when no token is sent', async () => {
    const response = await request(app)
      .put('/user')
      .field('name', 'newJoao')
      .field('password', '123123')
      .field('passwordConfirmation', '123123')
      .attach('image', filePath);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Token not found' });
  });

  it('should not update user when passwords dont match', async () => {
    const response = await request(app)
      .put('/user')
      .field('name', 'newJoao')
      .field('password', '123123')
      .field('passwordConfirmation', '123124')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(401);
    expect(response.text).toContain('[{"error":"Passwords must match"}]');
  });
});

describe('Testing get User', () => {
  const newUser = {
    name: 'joao',
    email: 'joao@test.com',
    password: '123123',
    passwordConfirmation: '123123',
  };

  const authUser = {
    email: 'joao@test.com',
    password: '123123',
  };

  let userId: string;

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    await request(app).post('/user').send(newUser);

    const authResponse = await request(app).post('/user/auth').send(authUser);
    userId = authResponse.body.id;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should get user', async () => {
    const response = await request(app).get(`/user/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      id: userId,
    });
  });

  it('should not get user when id is wrong', async () => {
    const response = await request(app).get(`/user/-33`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'invalid input syntax for type uuid: "-33"',
    });
  });
});
