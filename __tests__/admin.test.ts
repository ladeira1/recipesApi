import request from 'supertest';
import { getRepository } from 'typeorm';
import getToken from '../src/utils/getToken';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import app from '../src/app';
import connection from '../src/database/connection';
import User from '../src/models/User';

const newUser = {
  name: 'newAdmin',
  email: 'newAdmin@test.com',
  password: '123123',
  passwordConfirmation: '123123',
};

const createAdminUser = async () => {
  const adminUser = {
    name: 'joao',
    email: 'joao@test.com',
    password: '123123',
    passwordConfirmation: '123123',
  };

  const usersRepository = getRepository(User);
  const user = usersRepository.create({
    name: adminUser.name,
    email: adminUser.email,
    password: adminUser.password,
    isAdmin: true,
  });

  user.hashPassword(adminUser.password);
  await usersRepository.save(user);

  return getToken(user.id);
};

describe('Testing create admin user', () => {
  let token: string;
  let id: string;
  let notAdminToken: string;
  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    token = await createAdminUser();

    const user = await request(app).post('/user').send(newUser);
    id = user.body.id;
    notAdminToken = user.body.token;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create admin', async done => {
    const response = await request(app)
      .post('/user/admin')
      .send({ id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      imageUrl: null,
      isAdmin: true,
    });
    done();
  });

  it('should not create admin when request was not made by an admin', async done => {
    const response = await request(app)
      .post('/user/admin')
      .send({ id })
      .set('Authorization', `Bearer ${notAdminToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Only an admin can create another admin',
    });
    done();
  });

  it('should not create admin when no user is sent', async done => {
    const response = await request(app)
      .post('/user/admin')
      .set('Authorization', `Bearer ${notAdminToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Only an admin can create another admin',
    });
    done();
  });

  it('should not create admin when no token is sent', async done => {
    const response = await request(app).post('/user/admin').send({ id });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Token not found',
    });
    done();
  });
});
