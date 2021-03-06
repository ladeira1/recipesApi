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
import Category from './Category';
import Favorite from './Favorite';
import Review from './Review';

import User from './User';
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

  @Column({ type: 'varchar', length: 400 })
  ingredients: string;

  @Column({ type: 'varchar' })
  steps: string;

  @Column({ name: 'preparation_time', type: 'integer' })
  preparationTime: number;

  @Column({ type: 'integer' })
  serves: number;

  @Column({ type: 'numeric' })
  rating: Double;

  @Column({ name: 'created_at', type: 'date' })
  createdAt: Date;

  @OneToMany(() => UserRating, userRating => userRating.recipe)
  userRatings: UserRating[];

  @OneToMany(() => Review, review => review.recipe)
  reviews: Review[];

  @OneToMany(() => Favorite, favorite => favorite.recipe)
  favorites: Favorite[];

  @ManyToOne(() => Category, category => category.recipes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  category: Category;
}
