"use server";
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";
import fetch from "node-fetch";
import { UploadApiResponse } from "cloudinary";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function generateImageAi(imagePrompt: any) {
  try {
    // step 1: generate image using replicate api
    const input = {
      prompt: imagePrompt,
      output_format: "png",
      output_quality: 80,
      aspect_ratio: "1:1",
    };

    const output = (await replicate.run(
      "bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
      {
        input,
      }
    )) as String;
    const imageUrl = output[0];
    if (!imageUrl) throw new Error("Image generation failed");

    // step 2: fetch the image data from the generated image url
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // step 3: upload the image to cloudinary using a buffer
    const uploadResponse = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "ai_kids_book",
              public_id: nanoid(),
            },
            (error, result) => {
              if (error) return reject(error);
              if (!result)
                return reject(new Error("Cloudinary result is undefined"));
              resolve(result); // ✅ Now result is guaranteed to be UploadApiResponse
            }
          )
          .end(buffer);
      }
    );

    // step 4: return the cloudinary image url
    const cloudinaryUrl = uploadResponse.secure_url;
    console.log("cloudinary image => ", cloudinaryUrl);
    return cloudinaryUrl;
  } catch (err: any) {
    console.error(err);
    throw new Error(err.message);
  }
}
