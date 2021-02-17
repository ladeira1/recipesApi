import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import bcrypt from 'bcryptjs';

@Entity('User')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  email: string;

  @Column({
    name: 'profile_image_url',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  profileImageUrl: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 20 })
  password: string;

  hashPassword(): void {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  validatePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
}
