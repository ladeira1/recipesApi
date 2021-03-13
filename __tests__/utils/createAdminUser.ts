import { getRepository } from 'typeorm';
import getToken from '../../src/utils/getToken';
import User from '../../src/models/User';

export default async function createAdminUser(): Promise<string> {
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
}
