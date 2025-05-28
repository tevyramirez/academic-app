import { Request, Response } from "express";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../data-source";
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from "../dto/auth.dto";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const registerDto = new RegisterUserDto();
      Object.assign(registerDto, req.body);

      const errors = await validate(registerDto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Check if user already exists
      const existingUser = await userRepository.findOneBy({ email: registerDto.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create new user
      const user = new User();
      user.email = registerDto.email;
      user.password_hash = await bcrypt.hash(registerDto.password, SALT_ROUNDS);
      if (registerDto.name) {
        user.name = registerDto.name;
      }

      await userRepository.save(user);

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(201).json({
        message: "User registered successfully",
        token: token,  // Include token in response for frontend
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const loginDto = new LoginUserDto();
      Object.assign(loginDto, req.body);

      const errors = await validate(loginDto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const user = await userRepository.findOneBy({ email: loginDto.email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.json({
        message: "Login successful",
        token: token,  // Include token in response for frontend
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("token");
    return res.json({ message: "Logout successful" });
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = await userRepository.findOneBy({ id: (req as any).user.id });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const updateDto = new UpdateUserDto();
      Object.assign(updateDto, req.body);

      const errors = await validate(updateDto);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const user = await userRepository.findOneBy({ id: (req as any).user.id });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (updateDto.name) {
        user.name = updateDto.name;
      }

      if (updateDto.password) {
        user.password_hash = await bcrypt.hash(updateDto.password, SALT_ROUNDS);
      }

      if (updateDto.preferences) {
        user.preferences = updateDto.preferences;
      }

      await userRepository.save(user);

      return res.json({
        message: "Profile updated successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          preferences: user.preferences,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
