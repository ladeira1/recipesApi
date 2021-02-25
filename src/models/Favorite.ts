import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import User from './User';
import Recipe from './Recipe';

@Entity()
export default class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.favorites)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.favorites)
  @JoinColumn()
  recipe: Recipe;

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date;
}
