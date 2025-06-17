"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Book from "@/models/book";
import { authCheckAction } from "@/actions/auth";
import slugify from "slugify";
import { nanoid } from "nanoid";
import db from "@/utils/db";
import { HydratedDocument } from "mongoose";
import { IBook, IChapter } from "@/types/book";

// Set up Gemini AI
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ========== TYPES ==========
interface IGenerateStoryResponse {
  bookTitle: string;
  description: string;
  chapters: IChapter[];
}

interface ISaveStoryRequest {
  bookTitle: string;
  description: string;
  chapters: IChapter[];
}

interface IPaginatedBooks {
  books: IBook[];
  totalCount: number;
}

// ========== FUNCTIONS ==========

export async function generateStoryAi(
  prompt: string
): Promise<IGenerateStoryResponse> {
  const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const cleanResponse = text.trim().replace(/^```json|```$/g, "");
  const parsedResponse: IGenerateStoryResponse = JSON.parse(cleanResponse);

  return parsedResponse;
}

export async function saveStoryDb(data: ISaveStoryRequest): Promise<void> {
  try {
    const { user } = await authCheckAction();

    if (!user) {
      throw new Error("You need to be logged in to create a story book");
    }

    const slug = slugify(`${data.bookTitle}-${nanoid(6)}`, {
      lower: true,
      strict: true,
    });

    await Book.create({
      ...data,
      slug,
      author: user._id,
    });
  } catch (err: any) {
    throw new Error(err.message || "Error saving story");
  }
}

export async function getBooksDb(
  page: number,
  limit: number
): Promise<IPaginatedBooks> {
  try {
    db();

    const [books, totalCount] = await Promise.all([
      Book.find()
        .select(["-chapters"])
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("author", "name"),
      Book.countDocuments(),
    ]);

    return {
      books: JSON.parse(JSON.stringify(books)),
      totalCount,
    };
  } catch (err: any) {
    throw new Error(err.message || "Error fetching books");
  }
}

export async function getBookDb(slug: string): Promise<IBook | null> {
  try {
    db();
    const book = await Book.findOne({ slug }).populate("author", "name");
    return book ? JSON.parse(JSON.stringify(book)) : null;
  } catch (err: any) {
    throw new Error(err.message || "Error fetching book");
  }
}

export async function getUserBooksDb(
  page: number,
  limit: number
): Promise<IPaginatedBooks> {
  try {
    db();
    const { user } = await authCheckAction();

    if (!user) {
      throw new Error("You need to be logged in to view your stories");
    }

    const [books, totalCount] = await Promise.all([
      Book.find({ author: user._id })
        .select(["-chapters"])
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("author", "name"),
      Book.countDocuments({ author: user._id }),
    ]);

    return {
      books: JSON.parse(JSON.stringify(books)),
      totalCount,
    };
  } catch (err: any) {
    throw new Error(err.message || "Error fetching user books");
  }
}

export async function deleteBookDb(id: string): Promise<{ success: boolean }> {
  try {
    db();
    const { user } = await authCheckAction();

    if (!user) {
      throw new Error("You need to be logged in to delete a story");
    }

    const book: HydratedDocument<IBook> | null = await Book.findById(id);

    if (!book) throw new Error("Book not found");

    if (book.author.toString() !== user._id.toString()) {
      throw new Error("You are not authorized to delete this story");
    }

    await Book.findByIdAndDelete(id);

    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || "Error deleting book");
  }
}

export async function searchBooksDb(query: string): Promise<IBook[]> {
  try {
    await db();

    const books = await Book.find({
      $text: { $search: query },
    })
      .sort({ score: { $meta: "textScore" } })
      .limit(100)
      .exec();

    return JSON.parse(JSON.stringify(books));
  } catch (err: any) {
    console.error("Error in searchBooksDb:", err.message);
    throw new Error(err.message || "Error searching books");
  }
}
