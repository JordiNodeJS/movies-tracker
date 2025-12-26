import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "jordi.nodejs@gmail.com" },
    update: {},
    create: {
      id: "user_123",
      email: "jordi.nodejs@gmail.com",
      name: "Jordi",
    },
  });
  console.log("User:", user);

  const data = await prisma.watchlistItem.findMany({
    where: { userId: "user_123" },
  });
  console.log("Watchlist:", data);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
