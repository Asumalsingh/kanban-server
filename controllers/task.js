import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import Column from "../models/Column.js";
import Board from "../models/Board.js";

const createTask = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, columnId, boardId, dueDate, labels } = req.body;

  try {
    // Verify board exists and user has access
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Verify column exists and belongs to the board
    const column = await Column.findById(columnId);

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    if (column.boardId.toString() !== boardId) {
      return res
        .status(400)
        .json({ message: "Column does not belong to this board" });
    }

    // Find the highest order to place the new task at the end
    const lastTask = await Task.findOne({ columnId })
      .sort({ order: -1 })
      .limit(1);

    const order = lastTask ? lastTask.order + 1 : 0;

    // Create new task
    const task = new Task({
      title,
      description,
      columnId,
      boardId,
      order,
      dueDate,
      labels,
    });

    await task.save();

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, columnId, order, dueDate, labels } = req.body;

  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Find task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify board exists and user has access
    const board = await Board.findById(task.boardId);

    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // If changing column, verify it exists and belongs to the same board
    if (columnId && columnId !== task.columnId.toString()) {
      const column = await Column.findById(columnId);

      if (!column) {
        return res.status(404).json({ message: "Column not found" });
      }

      if (column.boardId.toString() !== task.boardId.toString()) {
        return res
          .status(400)
          .json({ message: "Column does not belong to this board" });
      }

      task.columnId = columnId;
    }

    // Update task
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (order !== undefined) task.order = order;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (labels) task.labels = labels;

    await task.save();

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Find task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify board exists and user has access
    const board = await Board.findById(task.boardId);

    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete task
    await Task.findByIdAndDelete(id);

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createTask, updateTask, deleteTask };
