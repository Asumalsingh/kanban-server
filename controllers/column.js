
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Column from "../models/Column.js";
import Board from "../models/Board.js";

const addColumn = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, boardId } = req.body;

  try {
    // Verify board exists and user has access
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find the highest order to place the new column at the end
    const lastColumn = await Column.findOne({ boardId })
      .sort({ order: -1 })
      .limit(1);

    const order = lastColumn ? lastColumn.order + 1 : 0;

    // Create new column
    const column = new Column({
      title,
      boardId,
      order,
    });

    await column.save();

    res.status(201).json({
      message: "Column created successfully",
      column,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateColumn = async (req, res) => {
  const { id } = req.params;
  const { title, order } = req.body;

  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid column ID" });
    }

    // Find column
    const column = await Column.findById(id);

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    // Verify board exists and user has access
    const board = await Board.findById(column.boardId);

    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update column
    if (title) column.title = title;
    if (order !== undefined) column.order = order;

    await column.save();

    res.json({
      message: "Column updated successfully",
      column,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteColumn = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid column ID" });
    }

    // Find column
    const column = await Column.findById(id);

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    // Verify board exists and user has access
    const board = await Board.findById(column.boardId);

    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete column
    await Column.findByIdAndDelete(id);

    res.json({
      message: "Column deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { addColumn, updateColumn, deleteColumn };
