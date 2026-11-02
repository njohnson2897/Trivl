import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./config/connection.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Railway sits behind a proxy, trust its X-Forwarded-For header
// so req.ip (and the rate limiter) see the real client IP.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://trivl.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// Connect to the database and start the server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Creates any missing tables; never changes existing ones.
    // Changes to existing tables are made by hand in Supabase's SQL editor.
    await sequelize.sync();
    console.log("Database synchronized successfully.");

    // Start the server
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}!`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
