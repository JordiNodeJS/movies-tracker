import "dotenv/config";
import { prisma } from "./src/lib/prisma";

import { generateRecommendations } from "./src/lib/recommendations";

async function main() {
  console.log("Generating recommendations...");
  const recs = await generateRecommendations("es");
  console.log("Generated recommendations:", recs.length);
  if (recs.length > 0) {
    console.log("First rec:", recs[0]);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
