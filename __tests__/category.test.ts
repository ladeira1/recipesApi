import request from 'supertest';
import Category from '../src/models/Category';
import createTypeormConnection from '../src/utils/createTypeormConnection';
import createAdminUser from './utils/createAdminUser';
import app from '../src/app';
import connection from '../src/database/connection';
import User from '../src/models/User';

const newUser = {
  name: 'newAdmin',
  email: 'newAdmin@test.com',
  password: '123123',
  passwordConfirmation: '123123',
};

describe('Testing create category', () => {
  let adminToken: string;
  let notAdminToken: string;
  const filePath = `${__dirname}/test-image/test.jpg`;

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    await connection.clear(Category);
    adminToken = await createAdminUser();

    const user = await request(app).post('/user').send(newUser);
    notAdminToken = user.body.token;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create a category', async done => {
    const response = await request(app)
      .post('/category')
      .field('name', 'test name')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'test name',
    });
    done();
  });

  it('should not create a category when user is not an admin', async done => {
    const response = await request(app)
      .post('/category')
      .field('name', 'test name')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${notAdminToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Only an admin can perform this action',
    });
    done();
  });

  it('should not create a category when no user is sent', async done => {
    const response = await request(app).post('/category');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Token not found',
    });
    done();
  });

  it('should not create a category when no data is sent', async done => {
    const response = await request(app)
      .post('/category')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(401);
    expect(response.text).toContain('Name must be informed');
    expect(response.text).toContain('Image must be informed');
    done();
  });
});

describe('Testing get category', () => {
  let adminToken: string;
  const filePath = `${__dirname}/test-image/test.jpg`;
  let categoryId: number;

  beforeAll(async () => {
    await createTypeormConnection();
  });

  beforeEach(async () => {
    await connection.clear(User);
    await connection.clear(Category);
    adminToken = await createAdminUser();

    const response = await request(app)
      .post('/category')
      .field('name', 'test name')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${adminToken}`);

    categoryId = response.body.id;

    await request(app)
      .post('/category')
      .field('name', 'test name 2')
      .attach('image', filePath)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should get a category', async done => {
    const response = await request(app).get(`/categories/${categoryId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: categoryId, name: 'test name' });
    done();
  });

  it('should not get a category when id is invalid', async done => {
    const response = await request(app).get('/categories/-12312321');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Category not found' });
    done();
  });

  it('should get many categories', async done => {
    const response = await request(app).get('/categories/1/5');

    expect(response.status).toBe(200);
    expect(response.text).toContain('test name');
    expect(response.text).toContain('test name 2');
    expect(response.text).toContain(categoryId);
    expect(response.text).toContain(categoryId + 1);
    done();
  });

  it('should not get many categories when no limit or page is sent', async done => {
    const response = await request(app).get('/categories');

    expect(response.status).toBe(404);
    expect(response.body).toContain({});
  });
});
