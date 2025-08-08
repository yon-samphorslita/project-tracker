import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { Role } from '../enums/role.enum';
@Entity('users')
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

    @OneToMany(() => Project, (project) => project.user)
    projects: Project[];

    @OneToMany(() => Task, (task) => task.user)
    tasks: Task[];
}