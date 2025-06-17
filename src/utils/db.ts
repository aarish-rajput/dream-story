import mongoose from "mongoose";

export default async function db(): Promise<void> {
  // If already connected, return early
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const dbUri = process.env.DATABASE;
    if (!dbUri) {
      throw new Error("Database URI is not provided");
    }
    await mongoose.connect(dbUri);
  } catch (err: unknown) {
    console.error("DB CONNECTION ERR!!", err);
  }
}
