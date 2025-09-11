import { Project } from "src/project/project.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  
  @OneToMany(() => User, (user) => user.team)
  pms: User[];

  @OneToMany(() => User, (user) => user.team)
  members: User[];

  @OneToMany(() => Project, (project) => project.team)
  projects: Project[];
}