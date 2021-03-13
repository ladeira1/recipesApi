import request from 'supertest';
import createAdminUser from './utils/createAdminUser';
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
      .put('/user/admin')
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
      .put('/user/admin')
      .send({ id })
      .set('Authorization', `Bearer ${notAdminToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Only an admin can perform this action',
    });
    done();
  });

  it('should not create admin when no user is sent', async done => {
    const response = await request(app)
      .put('/user/admin')
      .set('Authorization', `Bearer ${notAdminToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Only an admin can perform this action',
    });
    done();
  });

  it('should not create admin when no token is sent', async done => {
    const response = await request(app).put('/user/admin').send({ id });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Token not found',
    });
    done();
  });
});

describe('Testing delete admin user', () => {
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

    await request(app)
      .put('/user/admin')
      .send({ id })
      .set('Authorization', `Bearer ${token}`);

    const notAdmin = await request(app)
      .post('/user')
      .send({ ...newUser, email: 'notAdmin@gmail.com' });

    notAdminToken = notAdmin.body.token;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should delete admin access', async done => {
    const response = await request(app)
      .put('/user/admin/remove')
      .send({ id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      imageUrl: null,
      isAdmin: false,
    });
    done();
  });

  it('should not delete admin when request was not made by an admin', async done => {
    const response = await request(app)
      .put('/user/admin/remove')
      .send({ id })
      .set('Authorization', `Bearer ${notAdminToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Only an admin can perform this action',
    });
    done();
  });

  it('should not delete admin when no user is sent', async done => {
    const response = await request(app)
      .put('/user/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'User not found',
    });
    done();
  });

  it('should not delete admin when no token is sent', async done => {
    const response = await request(app).put('/user/admin').send({ id });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Token not found',
    });
    done();
  });
});
