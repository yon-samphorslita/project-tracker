import { Role } from 'src/enums/role.enum';
import { Project } from 'src/project/project.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEMBER,
  })
  role: Role;

  @CreateDateColumn()
  created_at: Date;

  // @ManyToOne(() => Project, (project) => project.members, {
  //   onDelete: 'CASCADE',
  // })
  // project: Project;

  // @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  // team: Team;

  @ManyToOne(() => User, (user) => user.members, { onDelete: 'CASCADE' })
  user: User;
}
