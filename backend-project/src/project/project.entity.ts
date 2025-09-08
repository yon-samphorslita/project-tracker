import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { Priority } from '../enums/priority.enum';
import { Task } from 'src/task/task.entity';
import { User } from 'src/user/user.entity';
import { Member } from 'src/member/member.entity';
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  p_name: string;

  @Column({ nullable: true })
  p_description: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.NOT_STARTED,
  })
  status: Status;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  due_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne((type) => User, (user) => user.projects, { nullable: true })
  user: User;

  @OneToMany((type) => Task, (task) => task.project)
  tasks: Task[];

  // @OneToMany((type) => Member, (member) => member.project)
  // members: Member[];

  // @ManyToOne(() => Team, (team) => team.projects, { onDelete: 'SET NULL' })
  // team: Team;
}
