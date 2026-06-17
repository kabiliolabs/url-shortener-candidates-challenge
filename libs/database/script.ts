import { prisma } from "./src/prisma.js";
import { createUrl } from "./src/url.controller.js";

async function main(): Promise<void> {
  const fullUrl = process.argv[2];
  if (!fullUrl) {
    throw new Error("Usage: pnpm db:seed -- https://www.google.com");
  }
  const record = await createUrl(fullUrl);
  console.log("Created url:", record);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
