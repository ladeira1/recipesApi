import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';

import Recipe from './Recipe';
import User from './User';

@Entity('UserRating')
export default class UserRating {
  @PrimaryColumn({ name: 'user_id' })
  @ManyToOne(() => User, user => user.userRatings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: string;

  @PrimaryColumn({ name: 'recipe_id' })
  @ManyToOne(() => Recipe, recipe => recipe.userRatings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: number;

  @Column({ type: 'numeric' })
  rating: number;
}
