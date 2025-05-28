import "reflect-metadata";
import { DataSource } from "typeorm";
import { Pregunta } from "./entities/pregunta.entity";
import { User } from "./entities/user.entity";
import { UserProgress } from "./entities/user-progress.entity";
import { UserAnalytics } from "./entities/user-analytics.entity";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Create and export the data source
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.TYPEORM_HOST || "localhost",
  port: parseInt(process.env.TYPEORM_PORT || "5432"),
  username: process.env.TYPEORM_USERNAME || "academicapp",
  password: process.env.TYPEORM_PASSWORD || "academicapppass",
  database: process.env.TYPEORM_DATABASE || "academicapp",
  // Synchronize should be false in production, migrations should be used.
  // Set to true only for development if you want quick schema updates without migrations.
  synchronize: !isProduction && process.env.TYPEORM_SYNCHRONIZE === "true",
  logging: process.env.TYPEORM_LOGGING === "true" || !isProduction,
  entities: [Pregunta, User, UserProgress, UserAnalytics],
  migrations: [__dirname + "/migrations/*.{js,ts}"], // Adjusted path for migrations
  subscribers: [],
});
