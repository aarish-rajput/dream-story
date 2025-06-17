"use server";

import validate from "deep-email-validator";
import db from "@/utils/db";
import User from "@/models/user";
import { hashPassword, comparePassword } from "@/utils/auth";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Types
interface JwtPayload {
  _id: string;
  name: string;
  role: string;
  email: string;
}

interface UserResponse {
  name: string;
  role: string;
  email: string;
}

interface AuthResult {
  user?: UserResponse;
  error?: string;
  loggedIn: boolean;
}

interface AuthCheckResult {
  user?: any;
  loggedIn: boolean;
}

interface LogoutResult {
  message: string;
}

const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

const setAuthCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set("auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
};

export const authCheckAction = async (): Promise<AuthCheckResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) return { loggedIn: false };

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    await db();
    const user = await User.findById(decoded._id).select("-password -__v");

    return { user: JSON.parse(JSON.stringify(user)), loggedIn: true };
  } catch (err) {
    return { loggedIn: false };
  }
};

export const loginOrRegisterAction = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const { valid } = await validate(email);
  if (!valid) return { error: "Invalid email", loggedIn: false };

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters", loggedIn: false };
  }

  await db();
  let user = await User.findOne({ email });

  if (user) {
    const match = await comparePassword(password, user.password);
    if (!match) return { error: "Invalid password", loggedIn: false };
  } else {
    // Register user
    user = new User({
      email,
      password: await hashPassword(password),
      name: email.split("@")[0],
    });
    await user.save();
  }

  const { _id, name, role } = user;
  const token = generateToken({ _id: _id.toString(), name, role, email });

  await setAuthCookie(token);

  return {
    user: { name, role, email },
    loggedIn: true,
  };
};

export const logoutAction = async (): Promise<LogoutResult> => {
  const cookieStore = await cookies();

  if (cookieStore.has("auth")) {
    cookieStore.delete("auth");
    return { message: "Successfully logged out" };
  }

  return { message: "No active session found" };
};
