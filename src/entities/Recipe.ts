import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Double,
} from 'typeorm';

import User from './User';

@Entity('Recipe')
export default class Recipe {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, user => user.recipes)
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
  createAt: Date;
}
