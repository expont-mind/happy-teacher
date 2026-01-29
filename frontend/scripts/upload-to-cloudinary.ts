/**
 * Cloudinary Upload Script
 *
 * Uploads all lesson images from public/fractions and public/multiplication
 * to Cloudinary with proper folder structure.
 *
 * Usage:
 *   npx tsx scripts/upload-to-cloudinary.ts
 *
 * Requires .env with:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PUBLIC_DIR = path.resolve(__dirname, "../public");
const FOLDERS = ["fractions", "multiplication"];

async function uploadFile(
  filePath: string,
  folder: string,
): Promise<{ localPath: string; url: string } | null> {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();

  // Determine public_id (without extension)
  const publicId = `happy-teacher/${folder}/${path.basename(fileName, ext)}`;

  // For mask images, disable any transformations to preserve exact pixel colors
  const isMask = fileName.includes("_mask");
  const isSvg = ext === ".svg";

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: isSvg ? "raw" : "image",
      overwrite: true,
      ...(isMask && {
        // Preserve exact pixel data for mask images
        quality: 100,
        format: "png",
      }),
    });

    console.log(`  Uploaded: ${fileName} -> ${result.secure_url}`);
    return { localPath: `/${folder}/${fileName}`, url: result.secure_url };
  } catch (error) {
    console.error(`  Failed: ${fileName}`, error);
    return null;
  }
}

async function uploadFolder(folder: string) {
  const folderPath = path.join(PUBLIC_DIR, folder);
  const files = fs.readdirSync(folderPath).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".svg", ".png", ".jpg", ".jpeg", ".webp"].includes(ext);
  });

  const results: { localPath: string; url: string }[] = [];

  // Upload in batches of 5 to avoid rate limits
  for (let i = 0; i < files.length; i += 5) {
    const batch = files.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map((file) => uploadFile(path.join(folderPath, file), folder)),
    );
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return results;
}

async function main() {
  const allResults: { localPath: string; url: string }[] = [];

  for (const folder of FOLDERS) {
    const results = await uploadFolder(folder);
    allResults.push(...results);
  }

  // Output mapping as JSON
  const outputPath = path.resolve(__dirname, "cloudinary-urls.json");
  const mapping: Record<string, string> = {};
  for (const r of allResults) {
    mapping[r.localPath] = r.url;
  }
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));

  console.log(`\nDone! ${allResults.length} files uploaded.`);
  console.log(`URL mapping saved to: ${outputPath}`);
}

main().catch(console.error);
