import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Chapter Interface
export interface IChapter {
  subTitle: string;
  textContent: string;
  imageUrl: string;
  page: string;
}

// Book Interface
export interface IBook extends Document {
  bookTitle: string;
  bookCoverUrl: string;
  chapters: IChapter[];
  slug: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Chapter Schema
const chapterSchema = new Schema<IChapter>(
  {
    subTitle: { type: String, required: true },
    textContent: { type: String, required: true },
    imageUrl: { type: String, required: true },
    page: { type: String, required: true },
  },
  { _id: false }
);

// Book Schema
const bookSchema = new Schema<IBook>(
  {
    bookTitle: { type: String, required: true },
    bookCoverUrl: { type: String, required: true },
    chapters: { type: [chapterSchema], required: true },
    slug: { type: String, required: true, unique: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Full-text indexes
chapterSchema.index({ subTitle: "text", textContent: "text" });
bookSchema.index({ bookTitle: "text" });

// Model
const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>("Book", bookSchema);

export default Book;
