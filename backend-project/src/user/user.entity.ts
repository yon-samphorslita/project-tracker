import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  Unique,
  ManyToOne,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { Role } from '../enums/role.enum';
import { Notification } from '../notification/notification.entity';
import { Team } from 'src/team/team.entity';
import { ActivityLog } from 'src/activity/activity.entity';
import { Event } from 'src/event/event.entity';
@Entity('users')
@Unique(['email'])
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

  @Column({ default: false })
  password_changed: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEMBER,
  })
  role: Role;

  @Column({ default: true, nullable: true })
  active: boolean;

  @Column({ nullable: true })
  img_url: string;

  @Column({ nullable: true })
  otp_code: string;

  @Column({ type: 'timestamp', nullable: true })
  otp_expiry: Date;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Main team (priority team)
  @ManyToOne(() => Team, (team) => team.mainMembers, { nullable: true })
  team: Team;
  @ManyToMany(() => Team, (team) => team.pms)
  pmTeams: Team[];

  // Other teams
  @ManyToMany(() => Team, (team) => team.members)
  secondaryTeams: Team[];

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToMany(() => ActivityLog, (activity) => activity.user)
  activities: ActivityLog[];
}
