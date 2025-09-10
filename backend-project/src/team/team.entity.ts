import { Member } from 'src/member/member.entity';
import { Project } from 'src/project/project.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Member, (member) => member.team)
  members: Member[];

  @OneToMany(() => Project, (project) => project.team)
  projects: Project[];
}
