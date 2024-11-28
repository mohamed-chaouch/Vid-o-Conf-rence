import { Request, Response } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { hashPassword } from "../utils/hashPassword.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import RefreshToken from "../models/RefreshToken.js";
dotenv.config();
interface UserObject {
  _id: string;
  username: string;
  email: string;
  imageUrl: string;
}

// Generate Access Token
const generateAccessToken = (user: UserObject) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
};

// Generate Refresh Token
const generateRefreshToken = async (user: UserObject) => {
  const refreshToken = jwt.sign(
    user,
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "30d" }
  );

  return refreshToken;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, imageUrl } = req.body;
    const newUser = new User({ username, email, password, imageUrl });
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // if (!password) {
    //     res.status(400).json({ message: "Password is required" });
    //     return;
    // }
    if (!req.file) {
      // return res.status(400).json({ message: "Image is required" });
      newUser.imageUrl = "default_user.jpg";
    } else {
      newUser.imageUrl = req.file.filename;
    }
    newUser.password = await hashPassword(password);

    const user = await newUser.save();
    if (!user) {
      return res.status(400).json({ message: "User not created" });
    }

    const accessToken = generateAccessToken({
      _id: (user._id as mongoose.Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    });

    const refreshToken = await generateRefreshToken({
      _id: (user._id as mongoose.Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: Boolean(process.env.production),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken, refreshToken, user });

    // Create a new instance of the RefreshToken model
    const newRefreshToken = new RefreshToken({
      userId: user._id,
      refreshToken: refreshToken,
      expiration: "30d",
    });

    // Save the instance to the database
    await newRefreshToken.save();
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const accessToken = generateAccessToken({
      _id: (user._id as mongoose.Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    });

    const refreshToken = await generateRefreshToken({
      _id: (user._id as mongoose.Types.ObjectId).toString(),
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: Boolean(process.env.production),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Send token in response
    res.status(200).json({ accessToken, refreshToken, user });

    const refreshTokenExistant = await RefreshToken.findOne({
      userId: user._id,
    });

    if (!refreshTokenExistant) {
      // Create a new instance of the RefreshToken model
      new RefreshToken({
        userId: user._id,
        refreshToken: refreshToken,
        expiration: "30d",
      }).save();
    } else {
      // Create a new instance of the RefreshToken model
      await RefreshToken.findOneAndUpdate(
        {
          userId: user._id,
        },
        { refreshToken: refreshToken }
      );
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const udpateUser = async (req: Request, res: Response) => {
  try {
    let { username, email, password, imageUrl } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    } else {
      imageUrl = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, password, imageUrl },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ message: "User not updated" });
    }

    res.status(200).json({ message: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
