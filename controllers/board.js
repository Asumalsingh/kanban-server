import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import mongoose from "mongoose";

const createBoard = async (req, res) => {
  try {
    // Create new board
    const board = new Board({
      title: "My Board",
      userId: req.user.id,
    });

    await board.save();

    // Create default columns, In future we can extend this to allow user to create custom columns
    const defaultColumns = [
      { title: "To Do", order: 0 },
      { title: "In Progress", order: 1 },
      { title: "Done", order: 2 },
    ];

    const columns = await Promise.all(
      defaultColumns.map((col) =>
        Column.create({
          title: col.title,
          boardId: board._id,
          order: col.order,
        })
      )
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserBoard = async (req, res) => {
  try {
    // Find the first board for the user (assuming one board per user)
    const board = await Board.findOne({ userId: req.user.id });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Get columns for the board
    const columns = await Column.find({ boardId: board._id }).sort({
      order: 1,
    });

    // Get tasks for each column
    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await Task.find({ columnId: column._id }).sort({
          order: 1,
        });
        return {
          ...column.toObject(),
          tasks,
        };
      })
    );

    res.json({
      board,
      columns: columnsWithTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid board ID" });
    }

    // Find board and verify ownership
    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Check if the user owns the board
    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get columns for the board
    const columns = await Column.find({ boardId: board._id }).sort({
      order: 1,
    });

    // Get tasks for each column
    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await Task.find({ columnId: column._id }).sort({
          order: 1,
        });
        return {
          ...column.toObject(),
          tasks,
        };
      })
    );

    res.json({
      board,
      columns: columnsWithTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createBoard, getUserBoard, getBoardById };
