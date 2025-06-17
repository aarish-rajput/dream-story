"use client";

import React, { useState, useLayoutEffect, useCallback, useRef } from "react";
import Image from "next/image";
import HTMLFlipbook from "react-pageflip";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  DownloadIcon,
  Loader2Icon,
} from "lucide-react";

import { jsPDF } from "jspdf";
import { Button } from "./ui/button";

type BookViewProps = {
  data: {
    bookTitle: string;
    bookCoverUrl: string;
    author: { name: string };
    chapters: {
      subTitle: string;
      textContent: string;
      imageUrl: string;
    }[];
  };
};

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const colors = ["gray", "red", "green", "blue", "yellow", "purple"] as const;

const colorVariants: Record<string, string> = {
  gray: "from-gray-200 to-gray-100",
  red: "from-red-200 to-red-100",
  green: "from-green-200 to-green-100",
  blue: "from-blue-200 to-blue-100",
  yellow: "from-yellow-200 to-yellow-100",
  purple: "from-purple-200 to-purple-100",
};

const bgColorClasses: Record<string, string> = {
  gray: "bg-white border-2 border-gray-300",
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
};

export default function BookView({ data }: BookViewProps) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [key, setKey] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [color, setColor] = useState("gray");

  const updateDimensions = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setKey((prevKey) => prevKey + 1);
  }, []);

  useLayoutEffect(() => {
    const debouncedUpdate = debounce(updateDimensions, 250);
    updateDimensions();
    window.addEventListener("resize", debouncedUpdate);
    return () => window.removeEventListener("resize", debouncedUpdate);
  }, [updateDimensions]);

  const isSinglePage = dimensions.width < 768;
  if (dimensions.width === 0) return null;

  const flipPrevPage = () => bookRef.current?.pageFlip().flipPrev("bottom");
  const flipNextPage = () => bookRef.current?.pageFlip().flipNext("bottom");
  const flipHomePage = () => bookRef.current?.pageFlip().flip(0, "top");

  // PDF download logic
  const downloadPdf = async () => {
    setIsDownloading(true);
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(22);
    doc.text(data.bookTitle, 20, 30);

    doc.setFontSize(16);
    doc.text(`By ${data.author.name}`, 20, 50);

    let y = 70;

    for (let i = 0; i < data.chapters.length; i++) {
      const chapter = data.chapters[i];

      doc.setFontSize(18);
      doc.text(`Chapter ${i + 1}: ${chapter.subTitle}`, 20, y);
      y += 10;

      // Load image as base64
      const imageData = await fetch(chapter.imageUrl)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            })
        );

      // Compute image size (auto-scale to fit)
      const imgProps = (doc as any).getImageProperties(imageData);
      const imgRatio = imgProps.width / imgProps.height;
      const imgWidth = pageWidth - 40;
      const imgHeight = imgWidth / imgRatio;

      // Add image
      doc.addImage(imageData, "JPEG", 20, y, imgWidth, imgHeight);
      y += imgHeight + 10;

      // Add text
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(
        chapter.textContent,
        pageWidth - 40
      );
      doc.text(splitText, 20, y);
      y += splitText.length * 6 + 10;

      // New page if needed
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save(`${data.bookTitle}.pdf`);
    setIsDownloading(false);
  };

  return (
    <div className="relative">
      <HTMLFlipbook
        key={key}
        ref={bookRef}
        width={
          isSinglePage
            ? dimensions.width * 0.95
            : Math.min(dimensions.width * 0.45, 800)
        }
        height={dimensions.height}
        size="stretch"
        minWidth={100}
        maxWidth={dimensions.width}
        minHeight={100}
        maxHeight={dimensions.height}
        maxShadowOpacity={0.5}
        mobileScrollSupport={true}
        drawShadow={true}
        useMouseEvents={false}
        showCover={isSinglePage}
        onFlip={(e) => {
          setCurrentPage(e.data);
          document.querySelectorAll(".page-scroll").forEach((el) => {
            el.scrollTop = 0;
          });
        }}
        style={{
          margin: "0 auto",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Cover Page */}
        <div
          className={`flex flex-col justify-center items-center p-6 h-full bg-gradient-to-b ${colorVariants[color]} relative`}
        >
          <Image
            src={data.bookCoverUrl}
            alt="Book Cover"
            fill
            style={{ objectFit: "cover" }}
            className="absolute inset-0 -z-10"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white z-10">
            {data.bookTitle}
          </h1>
        </div>

        {/* Author Page */}
        <div className="flex items-center justify-center p-6 h-full bg-white">
          <h1 className="text-2xl md:text-3xl font-medium text-center text-gray-700">
            By {data.author.name}
          </h1>
        </div>

        {/* Chapter Pages */}
        {data.chapters.map((page, index) => (
          <div
            key={index}
            className={`flex flex-col h-full w-full bg-gradient-to-b ${colorVariants[color]} relative`}
          >
            <div className="flex-1 w-full max-h-full p-4 overflow-hidden flex flex-col">
              <div
                className="overflow-y-auto page-scroll"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <h1 className="text-xl md:text-2xl font-bold mb-2 text-center break-words">
                  {page.subTitle}
                </h1>

                <div className="relative w-full aspect-video mb-4">
                  <Image
                    src={page.imageUrl}
                    alt={page.subTitle}
                    fill
                    className="object-cover rounded shadow"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words text-justify">
                  {page.textContent}
                </p>
              </div>

              <span className="mt-2 text-xs text-right text-gray-700">
                Page {index + 1}
              </span>
            </div>
          </div>
        ))}

        {/* End Page */}
        <div className="flex items-center justify-center p-6 h-full bg-white">
          <p className="text-lg md:text-xl font-medium text-gray-600">
            Thank you!
          </p>
        </div>
      </HTMLFlipbook>

      {/* Navigation & Controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-2 items-center justify-center bg-white bg-opacity-90 px-4 py-2 rounded shadow max-w-[90vw]">
        <button
          onClick={flipPrevPage}
          disabled={currentPage === 0}
          className={`p-2 rounded-full ${
            currentPage === 0
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-200"
          }`}
        >
          <ChevronLeft className="text-red-600" />
        </button>

        <button
          onClick={flipHomePage}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <BookOpen className="text-blue-600" />
        </button>

        <button
          onClick={flipNextPage}
          disabled={currentPage >= data.chapters.length}
          className={`p-2 rounded-full ${
            currentPage >= data.chapters.length
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-200"
          }`}
        >
          <ChevronRight className="text-green-600" />
        </button>

        {/* Download PDF button */}
        <Button
          onClick={downloadPdf}
          disabled={isDownloading}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2Icon className="animate-spin h-4 w-4" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4" />
              <span>Download PDF</span>
            </>
          )}
        </Button>

        {/* Colors */}
        <div className="flex space-x-2 ml-4">
          {colors.map((clr) => (
            <div
              key={clr}
              className={`w-5 h-5 rounded-full cursor-pointer ${bgColorClasses[clr]}`}
              onClick={() => setColor(clr)}
              title={clr}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
