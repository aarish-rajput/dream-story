import React from "react";
import { getBooksDb } from "@/actions/book";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import Bookcard from "@/components/Bookcard";

interface SearchParamsProps {
  searchParams?: {
    page?: string;
  };
}

interface Book {
  _id: string;
  slug: string;
  bookTitle: string;
  bookCoverUrl: string;
  author: {
    name: string;
  };
  // optionally add more fields if needed
}

interface GetBooksDbResponse {
  books: Book[];
  totalCount: number;
}

export default async function BooksPage({ searchParams }: SearchParamsProps) {
  const pageParam = searchParams?.page;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = 3;

  const { books, totalCount }: GetBooksDbResponse = await getBooksDb(
    currentPage,
    limit
  );
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="md:mt-0">
      <div className="p-5">
        <h1 className="text-2xl font-bold">Explore The Latest Books</h1>
        <p className="text-sm text-gray-500">Total books: {totalCount}</p>
        <br />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => (
            <div
              key={book._id}
              className="transform transition duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Link href={`/book/${book.slug}`}>
                <Bookcard book={book} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-5">
        <Pagination page={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
