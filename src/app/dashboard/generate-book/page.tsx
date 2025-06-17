"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { generateStoryAi, saveStoryDb } from "@/actions/book";
import { generateImageAi } from "@/actions/image";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

// Interfaces
interface Chapter {
  subTitle: string;
  textContent: string;
  imageDescription: string;
  imageUrl?: string;
  page: number;
}

interface StoryResponse {
  bookTitle: string;
  bookCoverDescription: string;
  chapters: Chapter[];
}

interface StoryToSave extends StoryResponse {
  bookCoverUrl: string;
  description: string;
}

export default function GenerateBookPage() {
  const [pages, setPages] = useState<number[]>([5]);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<{ title: string; status: boolean }>({
    title: "",
    status: false,
  });

  const router = useRouter();

  const handleGenerate = async () => {
    setLoading({ title: "Generating content...", status: true });

    const finalPrompt = `
      Your job is to write a kids story book.
      The topic of the story is: ${prompt}
      The story must have exactly ${pages[0]} chapters in an array format.

      I need the response in JSON format with the following details:
      - book title
      - book chapters in an array format with each object containing story
        subTitle, textContent, page and imageDescription to generate
        a vibrant, cartoon-style illustration using replicateAi.

      Example:
      {
        "bookTitle": "The Three Little Acorns learn about AI",
        "bookCoverDescription": "A vibrant, cartoon-style illustration of three acorns learning about AI under a large oak tree",
        "chapters": [
          {
            "subTitle": "A Curious Acorn",
            "textContent": "Once upon a time...",
            "imageDescription": "A cartoon-style acorn looking at a computer screen",
            "imageUrl": "/images/page1.jpeg",
            "page": 1
          }
        ]
      }
    `;

    try {
      const result: any = await generateStoryAi(finalPrompt);

      setLoading({ title: "Generating book cover image...", status: true });
      const bookCoverUrl: string = await generateImageAi(
        result.bookCoverDescription
      );

      setLoading({
        title:
          "Generating chapter images... This may take a while based on your internet speed and number of pages",
        status: true,
      });
      const chapterPromises = result.chapters.map(async (chapter: any) => {
        const imageUrl = await generateImageAi(chapter.imageDescription);
        return { ...chapter, imageUrl };
      });

      const chaptersWithImages = await Promise.all(chapterPromises);

      setLoading({ title: "Saving story to database...", status: true });

      const storyWithImages: StoryToSave = {
        ...result,
        bookCoverUrl,
        chapters: chaptersWithImages,
        description: prompt,
      };

      await saveStoryDb(storyWithImages);

      toast.success("Story saved successfully");

      setLoading({ title: "", status: false });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while generating the story.");
      setLoading({ title: "", status: false });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Number of pages: {pages[0]}
        </label>
        <Slider
          min={1}
          max={10}
          step={1}
          value={pages}
          onValueChange={setPages}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Story prompt</label>

        <Textarea
          placeholder="Enter your story prompt here... Or just click on generate for a random story"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          required
        />
      </div>

      {loading.status && (
        <p className="text-red-500 animate-pulse">{loading.title}</p>
      )}

      <div className="flex justify-end">
        <Button
          className="bg-green-600 hover:bg-green-800 rounded-full"
          onClick={handleGenerate}
          disabled={loading.status}
        >
          {loading.status ? (
            <>
              <Loader2Icon className="animate-spin mr-2" />
              Please wait...
            </>
          ) : (
            "Generate Book"
          )}
        </Button>
      </div>
    </div>
  );
}
