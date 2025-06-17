// src/models/User.ts
import mongoose, { Document, Model, Schema } from "mongoose";

// 1. Define an interface for the user data
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  about?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create the schema
const userSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    about: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

// 3. Create the model with proper types
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
