import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import Recipe from './Recipe';
import User from './User';

@Entity('UserRating')
@Unique(['user', 'recipe'])
export default class UserRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userRatings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.userRatings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @Column({ type: 'numeric' })
  rating: number;
}
