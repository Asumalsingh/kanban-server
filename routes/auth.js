import express from "express";
import { body } from "express-validator";
import { authenticateUser, generateToken } from "../middleware/auth.js";
import {
  getUserDetails,
  loginController,
  signUpController,
} from "../controllers/auth.js";

const router = express.Router();

// Validation middleware
const validateSignup = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name").notEmpty().withMessage("Name is required"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/signup", validateSignup, signUpController);
router.post("/login", validateLogin, loginController);
router.get("/me", authenticateUser, getUserDetails);

export default router;
