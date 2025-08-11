import { Status } from "src/enums/status.enum";
import { Task } from "src/task/task.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('subtasks')
export class Subtask {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.NOT_STARTED,
    })
    status: Status;

    @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE' })
    task: Task;

    @CreateDateColumn()
    created_at: Date;
}
