import express from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { createTask, deleteTask, updateTask } from "../controllers/task.js";

const router = express.Router();

// Validation middleware
const validateTask = [
  body("title").notEmpty().withMessage("Task title is required"),
  body("columnId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid column ID");
    }
    return true;
  }),
  body("boardId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid board ID");
    }
    return true;
  }),
];

// Create a new task
router.post("/", validateTask, createTask);

// Update task
router.patch("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);

export default router;
