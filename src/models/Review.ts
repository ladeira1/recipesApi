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
export default class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.reviews, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.reviews, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;
}
