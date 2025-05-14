import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "preguntas", schema: "study_app" }) // Especificamos el schema aquí
export class Pregunta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  text_content!: string;
  
  @Column("text", { nullable: true })
  respuesta_correcta!: string | null;

  @Column("text", { nullable: true })
  raw_source!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
