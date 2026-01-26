import type { MetadataRoute } from "next";
import { fractionLessons } from "@/src/data/lessons/fractions";
import { multiplicationLessons } from "@/src/data/lessons/multiplication";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://happyacademy.mn";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/topic`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/topic/fractions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topic/multiplication`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Generate lesson pages for fractions
  const fractionPages: MetadataRoute.Sitemap = fractionLessons.map((lesson) => ({
    url: `${baseUrl}/topic/fractions/${lesson.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Generate lesson pages for multiplication
  const multiplicationPages: MetadataRoute.Sitemap = multiplicationLessons.map(
    (lesson) => ({
      url: `${baseUrl}/topic/multiplication/${lesson.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  );

  return [...staticPages, ...fractionPages, ...multiplicationPages];
}
