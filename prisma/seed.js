const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.video.count();
  if (existing > 0) {
    console.log("Videos already seeded.");
    return;
  }

  // Update videoUrl/embedUrl/thumbnailUrl to point at real assets.
  await prisma.video.createMany({
    data: [
      {
        title: "Sample video",
        description: "Replace embedUrl/videoUrl with your own media.",
        thumbnailUrl: "/img/placeholder.jpg",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        isPublished: true,
      },
    ],
  });

  console.log("Seeded sample videos.");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
