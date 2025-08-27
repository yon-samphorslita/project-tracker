// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { Status } from '../enums/status.enum';
// import { Priority } from '../enums/priority.enum';
// import { Project } from 'src/project/project.entity';
// import { Task } from 'src/task/task.entity';
// import { User } from 'src/user/user.entity';

// @Entity('events')
// export class Event {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   e_title: string;

//   @Column({ nullable: true })
//   e_description: string;

//   @Column({ type: 'enum', enum: Status, default: Status.NOT_STARTED })
//   e_status: Status;

//   @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
//   e_priority: Priority;

//   @Column({ type: 'timestamp', nullable: true })
//   start_date: Date;

//   @Column({ type: 'timestamp', nullable: true })
//   end_date: Date;

//   @Column({ nullable: true })
//   location: string;

//   @ManyToOne(() => Project, (project) => project.events, { nullable: true })
//   project?: Project;

//   @ManyToOne(() => Task, (task) => task.events, { nullable: true })
//   task?: Task;

//   @ManyToOne(() => User, (user) => user.events, { nullable: true })
//   user?: User;

//   @CreateDateColumn()
//   created_at: Date;

//   @UpdateDateColumn()
//   updated_at: Date;
// }
