import express from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import {
  addColumn,
  deleteColumn,
  updateColumn,
} from "../controllers/column.js";

const router = express.Router();

// Validation middleware
const validateColumn = [
  body("title").notEmpty().withMessage("Column title is required"),
  body("boardId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid board ID");
    }
    return true;
  }),
];

// Create a new column
router.post("/", validateColumn, addColumn);

// Update column
router.patch("/:id", updateColumn);

// Delete column
router.delete("/:id", deleteColumn);

export default router;
