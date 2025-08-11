import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { Role } from '../enums/role.enum';
import { Notification } from '../notification/notification.entity';
import { Member } from 'src/member/member.entity';
@Entity('users')
@Unique(['email']) // Ensures that email is unique across users
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEMBER,
  })
  role: Role;
  @Column({ nullable: true })
  img_url: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

    @OneToMany(() => Task, (task) => task.user)
    tasks: Task[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToMany(() => Member, (member) => member.user)
    members: Member[];
}