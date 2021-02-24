import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import bcrypt from 'bcryptjs';

import Recipe from './Recipe';
import UserRating from './UserRating';
import Review from './Review';

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

  @OneToMany(() => Review, review => review.user)
  reviews?: Review[];

  @OneToMany(() => UserRating, userRating => userRating.user)
  userRatings: UserRating[];

  hashPassword(password: string): void {
    this.password = bcrypt.hashSync(password, 8);
  }

  validatePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
}
