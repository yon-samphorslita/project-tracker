import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  read_status: boolean;

  @Column({ nullable: true })
  link: string; 


  @CreateDateColumn()
  created_at: Date;

  // @Column({ type: 'timestamp', nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;
}
