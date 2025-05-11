import { validationResult } from "express-validator";
import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";
import Column from "../models/Column.js";
import Board from "../models/Board.js";

const signUpController = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Create default board for the user
    const board = new Board({
      title: "My Board",
      userId: user._id,
    });
    await board.save();

    // Create default columns, In future we can extend this to allow user to create custom columns
    const defaultColumns = [
      { title: "To Do", order: 0 },
      { title: "In Progress", order: 1 },
      { title: "Done", order: 2 },
    ];

    await Promise.all(
      defaultColumns.map((col) =>
        Column.create({
          title: col.title,
          boardId: board._id,
          order: col.order,
        })
      )
    );

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginController = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's board
    const board = await Board.findOne({ userId: user._id });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        board: {
            id: board._id,
            title: board.title,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { signUpController, loginController, getUserDetails };
