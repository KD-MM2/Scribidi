import bcrypt from "bcryptjs";
// import * as bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import prisma from "../utils/db";
import env from "../utils/env";

// import { JwtPayload } from "@/types/schema";

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(400).send({ message: "User not found" });
      return;
    }

    // const isMatch = await compare_password(user.hashed_password, password);
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // remove hashed_password from user object
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
    res.status(200).json({ token, user });
    return;
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    return;
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).send("Email already registered");
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashed_password = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashed_password,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    return;
  }
};

const me = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        setting: true,
      },
    });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    return;
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const decoded = jwt.decode(token) as JwtPayload;
      const expiration = decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date();
      await prisma.expiredToken.create({
        data: {
          token,
          expiresAt: expiration,
        },
      });
    }
    res.status(200).json({ message: "Logged out" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export { login, register, me, logout };
