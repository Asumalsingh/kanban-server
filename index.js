import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/board.js";
import columnRoutes from "./routes/column.js";
import taskRoutes from "./routes/task.js";

// Middleware
import { authenticateUser } from "./middleware/auth.js";

// Config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const httpServer = createServer(app);

// All routes will goes here
app.use("/api/auth", authRoutes);
app.use("/api/board", authenticateUser, boardRoutes);
app.use("/api/column", authenticateUser, columnRoutes);
app.use("/api/task", authenticateUser, taskRoutes);

app.get("/", (req, res) => {
  res.send("Kanban Board API is running");
});

// Connect mongodb then listion for server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    httpServer.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

export { app };
