import { Project } from 'src/project/project.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  // PMs (Many-to-Many)
  @ManyToMany(() => User, (user) => user.team)
  @JoinTable({ name: 'team_pms' })
  pms: User[];

  // Secondary Members (Many-to-Many)
  @ManyToMany(() => User, (user) => user.secondaryTeams)
  @JoinTable({ name: 'user_teams' })
  members: User[];

  // Users who have this team as main
  @OneToMany(() => User, (user) => user.team)
  mainMembers: User[];

  @OneToMany(() => Project, (project) => project.team)
  projects: Project[];
}
