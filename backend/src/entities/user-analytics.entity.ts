import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "user_analytics", schema: "study_app" })
export class UserAnalytics {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.analytics)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: 'jsonb' })
    performance_metrics!: {
        overall_accuracy: number;
        topics_accuracy: { [key: string]: number };
        improvement_rate: number;
        study_patterns: {
            preferred_times: string[];
            session_duration_avg: number;
            questions_per_session_avg: number;
        };
        weak_areas: string[];
        strong_areas: string[];
    };

    @Column({ type: 'jsonb' })
    learning_insights!: {
        recommended_topics: string[];
        difficulty_progression: string;
        optimal_study_time: string;
        suggested_review_intervals: { [topic: string]: number };
    };

    @Column({ type: 'jsonb' })
    engagement_metrics!: {
        study_streak: number;
        total_study_time: number;
        session_frequency: number;
        last_active: Date;
    };

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
