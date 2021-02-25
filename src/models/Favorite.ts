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

  @ManyToOne(() => User, user => user.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.favorites, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  recipe: Recipe;

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date;
}
