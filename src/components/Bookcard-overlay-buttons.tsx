"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteBookDb } from "@/actions/book";

export default function OverlayButtons({ book }: any) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isConfirm = confirm("Are you sure you want to delete this book?");
    if (!isConfirm) return;
    await deleteBookDb(book._id);
    router.refresh();
  };

  return (
    <div
      className={`
        absolute inset-0 
        flex items-center justify-center 
        bg-black/60 text-white rounded-xl 
        opacity-100 md:opacity-0 md:group-hover:opacity-100 
        transition-opacity duration-300
        z-10
      `}
    >
      <div className="flex space-x-4">
        <Link href={`/book/${book.slug}`}>
          <Button className="bg-purple-900 text-white hover:bg-purple-800">
            View
          </Button>
        </Link>
        <Button
          onClick={handleDelete}
          className="bg-red-500 text-white hover:bg-red-700"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
