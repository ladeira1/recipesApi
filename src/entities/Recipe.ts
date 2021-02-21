import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Double,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';

import User from './User';
import Step from './Step';
import UserRating from './UserRating';

@Entity('Recipe')
@Unique(['name', 'user'])
export default class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.recipes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ name: 'recipe_image_url', type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  ingredients: string;

  @Column({ name: 'preparation_time', type: 'integer' })
  preparationTime: number;

  @Column({ type: 'integer' })
  serves: number;

  @Column({ type: 'numeric' })
  rating: Double;

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date;

  @OneToMany(() => Step, step => step.recipe, { eager: true })
  steps: Step[];

  @OneToMany(() => UserRating, userRating => userRating.recipe)
  userRatings: UserRating[];
}
