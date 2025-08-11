import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { Priority } from '../enums/priority.enum';
import { Project } from 'src/project/project.entity';
import { User } from 'src/user/user.entity';
// import { Subtask } from 'src/subtask/subtask.entity';
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  t_name: string;

  @Column({ nullable: true })
  t_description: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  t_status: Status;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  t_priority: Priority;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  due_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne((type) => Project, (project) => project.tasks)
  project: Project;

  @ManyToOne((type) => User, (user) => user.tasks, { nullable: true })
  user: User;

  // @OneToMany((type) => Subtask, (subtask) => subtask.project)
  // subtask: Subtask[];
}
