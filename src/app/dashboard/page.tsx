import React from "react";
import { getUserBooksDb } from "@/actions/book";
import Link from "next/link";
import BookCard from "@/components/Bookcard";
import Pagination from "@/components/Pagination";
import OverlayButtons from "@/components/Bookcard-overlay-buttons";

export default async function DashboardPage({ searchParams }: any) {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const limit = 3;

  const { books, totalCount } = await getUserBooksDb(currentPage, limit);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="mx-10 md:mt-0">
      <div className="pt-5">
        <h1 className="text-2xl font-bold">My Library</h1>
        <p className="text-sm text-gray-500">Total books: {totalCount}</p>

        <br />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => (
            <div
              key={book._id}
              className="relative group overflow-hidden rounded-xl"
            >
              <BookCard book={book} />
              <OverlayButtons book={book} />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-5">
          <Pagination totalPages={totalPages} page={currentPage} />
        </div>
      </div>
    </div>
  );
}
