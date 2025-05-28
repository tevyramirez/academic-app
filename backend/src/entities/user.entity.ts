import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { UserProgress } from "./user-progress.entity";
import { UserAnalytics } from "./user-analytics.entity";

@Entity({ name: "users", schema: "study_app" })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password_hash!: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ default: false })
    is_verified!: boolean;

    @Column({ default: "student" })
    role!: string;

    @Column({ type: 'jsonb', nullable: true })
    preferences?: any;

    @OneToMany(() => UserProgress, progress => progress.user)
    progress!: UserProgress[];

    @OneToMany(() => UserAnalytics, analytics => analytics.user)
    analytics!: UserAnalytics[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
