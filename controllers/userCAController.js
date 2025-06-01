// controllers/userController.js
import UserCA from "../models/userCA.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await UserCA.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );
  res.json({ token, displayName: user.displayName, role: user.role });
};

export const register = async (req, res) => {
  const { username, password, displayName, role } = req.body;
  const existing = await UserCA.findOne({ username });
  if (existing) return res.status(409).json({ message: "Username exists" });

  const newUser = await UserCA.create({
    username,
    password,
    displayName,
    role,
  });
  res.json({ message: "User created", user: newUser });
};

// function to check all users in the database
// const checkAllUsers = async () => {
//   try {
//     const users = await UserCA.find();
//     if (users.length === 0) {
//       console.log("No users found in the database.");
//     } else {
//       console.log("Users found:", users);
//     }
//   } catch (error) {
//     console.error("Error fetching users:", error);
//   }
// };

// checkAllUsers();
