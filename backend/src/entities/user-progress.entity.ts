import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Pregunta } from "./pregunta.entity";

@Entity({ name: "user_progress", schema: "study_app" })
export class UserProgress {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.progress)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Pregunta)
    @JoinColumn({ name: "pregunta_id" })
    pregunta!: Pregunta;

    @Column()
    answer!: string;

    @Column()
    is_correct!: boolean;

    @Column({ type: 'float' })
    response_time!: number; // Time taken to answer in seconds

    @Column({ type: 'jsonb', nullable: true })
    metadata?: any; // Additional data about the answer attempt

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
