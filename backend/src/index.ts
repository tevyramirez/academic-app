import "reflect-metadata";
import { AppDataSource } from "./data-source";
import app from "./app";

// Define the port
const PORT = process.env.PORT || 3000;

// Initialize the database connection and start the server
AppDataSource.initialize()
  .then(async () => {
    console.log("Database initialized successfully");

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });