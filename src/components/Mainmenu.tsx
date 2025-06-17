"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/context/auth";
import { Menu, X } from "lucide-react";

export default function Mainmenu() {
  const { user, loggedIn, logout } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-purple-700 shadow-md">
      <div className="flex justify-between items-center px-4 py-2">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="logo" width={40} height={40} priority />
          <span className="ml-2 text-xl font-bold text-purple-800">
            Dream Story
          </span>
        </Link>

        {/* Toggle button */}
        <button
          className="md:hidden text-purple-800"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-4 text-purple-800 text-lg">
          <Link href="/books" className="hover:text-green-800">
            Books
          </Link>
          <Link
            href="/dashboard/generate-book"
            className="hover:text-green-800"
          >
            Generate Book
          </Link>
          <Link href="/search" className="hover:text-green-800">
            Search
          </Link>
          {loggedIn ? (
            <div>
              <Link href="/dashboard" className="relative p-2 capitalize">
                {user?.name}
                <span className="absolute top-1 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
              </Link>
              <Link
                href="/"
                className="hover:text-red-800 cursor-pointer"
                onClick={logout}
              >
                Logout
              </Link>
            </div>
          ) : (
            <Link href="/login" className="hover:text-green-800">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu with transition */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3 px-4 pb-4 text-purple-800 text-lg bg-white">
          <Link
            href="/books"
            className="hover:text-green-800"
            onClick={() => setMenuOpen(false)}
          >
            Books
          </Link>
          <Link
            href="/dashboard/generate-book"
            className="hover:text-green-800"
            onClick={() => setMenuOpen(false)}
          >
            Generate Book
          </Link>
          <Link
            href="/search"
            className="hover:text-green-800"
            onClick={() => setMenuOpen(false)}
          >
            Search
          </Link>
          {loggedIn ? (
            <div>
              <Link
                href="/dashboard"
                className="capitalize"
                onClick={() => setMenuOpen(false)}
              >
                {user?.name}
              </Link>
              <br />
              <Link
                href="/"
                className="hover:text-red-800 cursor-pointer mt-10"
                onClick={logout}
              >
                Logout
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="hover:text-green-800"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
