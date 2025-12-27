"use server";

import { generateRecommendations as generateRecs } from "./recommendations";
import { revalidateTag } from "next/cache";

export async function generateRecommendations(language: string = "en") {
  const result = await generateRecs(language);
  revalidateTag("recommendations");
  return result;
}
