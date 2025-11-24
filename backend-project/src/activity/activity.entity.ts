import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('activity')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.activities, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ nullable: true })
  taskId: number;

  @Column()
  action: string;

  @CreateDateColumn()
  createdAt: Date;
}
