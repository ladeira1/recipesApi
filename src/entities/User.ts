import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import bcrypt from 'bcryptjs';

import Recipe from './Recipe';

@Entity('User')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  email: string;

  @Column({
    name: 'profile_image_url',
    type: 'varchar',
    nullable: true,
  })
  profileImageUrl?: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 100,
  })
  password: string;

  @OneToMany(() => Recipe, recipe => recipe.user)
  recipes?: Recipe[];

  hashPassword(password: string): void {
    this.password = bcrypt.hashSync(password, 8);
  }

  validatePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
}
