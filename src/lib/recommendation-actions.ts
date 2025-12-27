"use server";

import { generateRecommendations as generateRecs } from "./recommendations";
import { revalidateTag } from "next/cache";
import { ensureUser } from "./actions";

export async function generateRecommendations(language: string = "en") {
  const user = await ensureUser();
  const result = await generateRecs(user.id, language);
  revalidateTag("recommendations", "max");
  return result;
}
