import { Project } from 'src/project/project.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.pmTeams)
  @JoinTable({ name: 'team_pms' })
  pms: User[];

  @OneToMany(() => User, (user) => user.team)
  members: User[];

  @OneToMany(() => Project, (project) => project.team)
  projects: Project[];
}
