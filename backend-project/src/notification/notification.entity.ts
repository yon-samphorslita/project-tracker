import { User } from "src/user/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;
    
    @Column()
    read_status: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
    user: User;

}

