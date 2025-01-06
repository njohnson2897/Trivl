import express from "express";
import cors from 'cors';
import dotenv from "dotenv";

import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from "./config/connection.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// For ES Modules (resolve __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app's build folder
const buildPath = path.join(__dirname, '../dist'); // Adjust if your React build folder has a different name
app.use(express.static(buildPath));

// Serve React frontend for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
});
