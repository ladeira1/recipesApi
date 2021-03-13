import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import Recipe from './Recipe';

@Entity('Category')
export default class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', scale: 20 })
  name: string;

  @Column({ name: 'image_url', type: 'varchar' })
  imageUrl: string;

  @OneToMany(() => Recipe, recipe => recipe.category)
  recipes: Recipe[];
}
