import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Recipe from './Recipe';

@Entity('Step')
export default class Step {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Recipe, recipe => recipe.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe' })
  recipe: Recipe;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date;
}
