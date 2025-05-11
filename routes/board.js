import express from "express";

import { getBoardById } from "../controllers/board.js";

const router = express.Router();

// Get board by ID
router.get("/:id", getBoardById);

export default router;
