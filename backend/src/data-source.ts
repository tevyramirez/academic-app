import "reflect-metadata";
import { DataSource } from "typeorm";
import { Pregunta } from "./entities/pregunta.entity";
import dotenv from "dotenv";

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Create and export the data source
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.TYPEORM_HOST || "localhost",
  port: parseInt(process.env.TYPEORM_PORT || "5432"),
  username: process.env.TYPEORM_USERNAME || "studyuser",
  password: process.env.TYPEORM_PASSWORD || "studypass",
  database: process.env.TYPEORM_DATABASE || "studydb",
  synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
  logging: process.env.TYPEORM_LOGGING === "true",
  entities: [Pregunta],
  migrations: [],
  subscribers: [],
});