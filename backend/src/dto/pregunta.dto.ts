import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreatePreguntaDto {
  @IsNotEmpty({ message: "text_content is required" })
  @IsString({ message: "text_content must be a string" })
  text_content!: string;

  @IsOptional()
  @IsString({ message: "raw_source must be a string" })
  raw_source?: string;
}