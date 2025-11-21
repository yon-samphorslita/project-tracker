import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { Project } from '../project/project.entity';
import { User } from '../user/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  e_name: string;

  @Column({ nullable: true })
  e_description: string;

  @Column({ type: 'enum', enum: Status, default: Status.NOT_STARTED })
  e_status: Status;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ nullable: true })
  location: string;

  @ManyToOne(() => Project, (project) => project.events, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  project?: Project;

  @ManyToOne(() => User, (user) => user.events, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
