import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Recipe from './Recipe';

@Entity('Step')
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Recipe, recipe => recipe.steps)
  @JoinColumn({ name: 'recipe' })
  recipe: Recipe;

  @Column({ type: 'varchar' })
  content: string;
}
