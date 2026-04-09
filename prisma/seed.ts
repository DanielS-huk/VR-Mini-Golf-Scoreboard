import { Difficulty, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const players = ["Dan", "Mike"];

const courseData = [
  {
    name: "20,000 Leagues Under the Sea",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 3, 4, 4, 3, 4, 3, 3, 4, 3, 4, 3, 3, 3],
      HARD: [3, 3, 3, 3, 3, 3, 4, 4, 3, 4, 3, 3, 4, 3, 4, 3, 3, 4],
    },
  },
  {
    name: "8-bit Lair",
    layouts: {
      EASY: [2, 3, 3, 4, 3, 3, 2, 3, 3, 3, 4, 3, 4, 4, 4, 2, 3, 4],
      HARD: [3, 3, 3, 4, 3, 3, 3, 3, 4, 4, 4, 4, 4, 3, 3, 3, 4, 3],
    },
  },
  {
    name: "Alfheim",
    layouts: {
      EASY: [3, 3, 4, 3, 3, 3, 2, 3, 3, 3, 3, 4, 3, 3, 4, 3, 3, 4],
      HARD: [5, 3, 3, 4, 3, 4, 4, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 3],
    },
  },
  {
    name: "Alices Adventures in Wonderland",
    layouts: {
      EASY: [3, 3, 3, 3, 4, 3, 4, 4, 3, 3, 3, 5, 3, 4, 4, 3, 4, 5],
      HARD: [3, 3, 3, 3, 4, 3, 4, 4, 3, 4, 3, 5, 3, 5, 4, 3, 4, 5],
    },
  },
  {
    name: "Arizona Modern",
    layouts: {
      EASY: [3, 3, 4, 4, 4, 3, 3, 5, 4, 4, 4, 5, 4, 3, 3, 3, 3, 4],
      HARD: [3, 3, 4, 4, 3, 3, 3, 5, 4, 4, 4, 5, 4, 3, 3, 3, 3, 4],
    },
  },
  {
    name: "Around the World in 80 Days",
    layouts: {
      EASY: [3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      HARD: [3, 3, 4, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 2, 3, 3, 4],
    },
  },
  {
    name: "Atlantis",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 4, 4, 3, 3, 4, 3, 3, 3],
      HARD: [3, 3, 3, 3, 3, 3, 3, 2, 4, 3, 4, 4, 3, 3, 3, 4, 3, 5],
    },
  },
  {
    name: "Bogeys Bonanza",
    layouts: {
      EASY: [2, 3, 4, 3, 4, 4, 3, 4, 4, 3, 2, 4, 4, 3, 4, 3, 3, 3],
      HARD: [3, 3, 5, 4, 4, 3, 3, 4, 4, 3, 2, 5, 4, 3, 5, 3, 3, 6],
    },
  },
  {
    name: "Cherry Blossom",
    layouts: {
      EASY: [3, 4, 3, 4, 3, 3, 3, 4, 3, 5, 3, 4, 2, 3, 3, 3, 3, 7],
      HARD: [3, 4, 3, 4, 3, 3, 3, 4, 3, 8, 3, 3, 2, 4, 3, 4, 4, 6],
    },
  },
  {
    name: "Crystal Lair",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 4, 4, 3],
      HARD: [3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 4, 4, 3, 4, 3, 3, 3, 3],
    },
  },
  {
    name: "El Dorado",
    layouts: {
      EASY: [3, 3, 3, 3, 4, 3, 3, 3, 5, 3, 5, 4, 3, 3, 3, 3, 3, 5],
      HARD: [3, 3, 3, 3, 4, 4, 3, 3, 5, 3, 4, 3, 3, 3, 3, 3, 3, 5],
    },
  },
  {
    name: "Forgotten Fairyland",
    layouts: {
      EASY: [3, 2, 3, 3, 4, 3, 3, 5, 3, 4, 3, 4, 4, 4, 5, 3, 3, 5],
      HARD: [3, 3, 3, 3, 4, 3, 2, 5, 3, 2, 3, 3, 4, 4, 5, 3, 2, 4],
    },
  },
  {
    name: "Gardens of Babylon",
    layouts: {
      EASY: [2, 3, 3, 4, 3, 5, 2, 3, 6, 3, 4, 4, 3, 4, 3, 3, 3, 3],
      HARD: [3, 3, 4, 3, 4, 6, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 4, 4],
    },
  },
  {
    name: "Holiday Hideaway",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 4, 4, 3, 2],
      HARD: [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 2, 4, 3, 3, 2],
    },
  },
  {
    name: "Hollywood",
    layouts: {
      EASY: [3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 4, 3, 4, 3, 3],
      HARD: [3, 3, 4, 3, 3, 4, 3, 3, 4, 4, 3, 4, 5, 3, 4, 4, 3, 3],
    },
  },
  {
    name: "Ice Lair",
    layouts: {
      EASY: [2, 3, 3, 3, 3, 4, 3, 4, 3, 3, 3, 3, 4, 4, 3, 5, 4, 4],
      HARD: [3, 2, 2, 3, 3, 4, 3, 3, 3, 4, 3, 3, 4, 3, 3, 5, 4, 4],
    },
  },
  {
    name: "Journey to the Center of the Earth",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3],
      HARD: [3, 3, 3, 4, 3, 4, 4, 3, 3, 3, 3, 4, 3, 3, 4, 3, 3, 4],
    },
  },
  {
    name: "Labyrinth",
    layouts: {
      EASY: [3, 3, 4, 5, 3, 3, 3, 4, 4, 3, 3, 3, 3, 4, 4, 3, 3, 6],
      HARD: [3, 3, 4, 5, 3, 3, 3, 3, 5, 3, 3, 4, 3, 5, 4, 3, 4, 4],
    },
  },
  {
    name: "Laser Lair",
    layouts: {
      EASY: [3, 3, 3, 3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 4, 3, 4, 3, 2],
      HARD: [3, 3, 3, 3, 3, 3, 4, 3, 4, 4, 3, 3, 4, 3, 3, 3, 3, 3],
    },
  },
  {
    name: "Mars Gardens",
    layouts: {
      EASY: [3, 3, 2, 4, 3, 3, 3, 4, 5, 3, 3, 3, 3, 3, 3, 3, 4, 3],
      HARD: [3, 3, 3, 4, 3, 3, 3, 3, 5, 3, 3, 4, 3, 4, 3, 3, 4, 3],
    },
  },
  {
    name: "Meow Wolf",
    layouts: {
      EASY: [3, 2, 3, 4, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 4, 4, 2],
      HARD: [3, 2, 3, 3, 2, 3, 3, 4, 3, 3, 2, 5, 4, 3, 3, 5, 4, 2],
    },
  },
  {
    name: "Mount Olympus",
    layouts: {
      EASY: [3, 3, 3, 4, 3, 3, 4, 4, 3, 3, 3, 4, 3, 4, 3, 3, 4, 4],
      HARD: [4, 4, 4, 4, 4, 3, 4, 3, 4, 3, 3, 3, 3, 3, 4, 3, 3, 3],
    },
  },
  {
    name: "Myst",
    layouts: {
      EASY: [3, 3, 3, 3, 4, 3, 4, 3, 4, 3, 3, 3, 4, 3, 4, 3, 4, 4],
      HARD: [3, 3, 3, 3, 3, 3, 5, 3, 4, 3, 3, 4, 4, 3, 4, 3, 4, 5],
    },
  },
  {
    name: "Original Gothic",
    layouts: {
      EASY: [2, 3, 3, 3, 2, 3, 3, 3, 2, 3, 4, 3, 3, 3, 3, 4, 4, 3],
      HARD: [2, 3, 3, 4, 3, 3, 3, 4, 4, 4, 5, 4, 3, 3, 3, 4, 5, 4],
    },
  },
  {
    name: "Quixote Valley",
    layouts: {
      EASY: [2, 2, 3, 4, 3, 3, 3, 3, 3, 3, 2, 3, 3, 4, 3, 3, 3, 4],
      HARD: [3, 3, 3, 5, 4, 3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 4],
    },
  },
  {
    name: "Raptor Cliffs",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 2, 3, 4, 4, 3, 3, 4, 3, 4, 3, 3, 3, 5],
      HARD: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    },
  },
  {
    name: "Seagull Stacks",
    layouts: {
      EASY: [2, 3, 3, 4, 2, 5, 4, 3, 3, 4, 3, 3, 4, 3, 5, 3, 3, 5],
      HARD: [2, 3, 4, 3, 4, 5, 4, 3, 4, 4, 3, 3, 5, 3, 5, 4, 3, 5],
    },
  },
  {
    name: "Shangri-La",
    layouts: {
      EASY: [2, 3, 3, 4, 4, 3, 4, 3, 3, 4, 3, 5, 3, 5, 4, 3, 3, 5],
      HARD: [4, 4, 2, 3, 4, 4, 4, 3, 4, 4, 3, 3, 3, 5, 5, 3, 4, 6],
    },
  },
  {
    name: "Sweetopia",
    layouts: {
      EASY: [2, 3, 4, 3, 3, 2, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 2, 4],
      HARD: [3, 3, 4, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3, 2, 4, 4, 3, 4],
    },
  },
  {
    name: "Temple at Zerzura",
    layouts: {
      EASY: [3, 4, 3, 4, 3, 5, 4, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 5],
      HARD: [4, 3, 3, 4, 3, 5, 4, 3, 3, 3, 2, 3, 3, 4, 3, 4, 3, 3],
    },
  },
  {
    name: "Tethys Station",
    layouts: {
      EASY: [2, 3, 3, 4, 3, 3, 4, 5, 3, 3, 3, 4, 3, 4, 3, 4, 5, 4],
      HARD: [3, 3, 4, 3, 4, 3, 4, 5, 3, 3, 3, 3, 3, 3, 4, 4, 5, 4],
    },
  },
  {
    name: "Tiki a Coco",
    layouts: {
      EASY: [3, 2, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 2],
      HARD: [3, 3, 4, 3, 3, 3, 4, 3, 3, 3, 2, 4, 3, 3, 3, 4, 4, 2],
    },
  },
  {
    name: "Tokyo",
    layouts: {
      EASY: [3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3],
      HARD: [3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 4, 3, 2],
    },
  },
  {
    name: "Tourist Trap",
    layouts: {
      EASY: [2, 2, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 4, 3, 3, 3, 6],
      HARD: [2, 3, 3, 3, 3, 4, 3, 3, 4, 3, 3, 3, 4, 4, 4, 3, 3, 6],
    },
  },
  {
    name: "Upside Town",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 4, 3, 3, 4, 4, 3, 2, 3, 4, 3, 4, 3, 3],
      HARD: [3, 4, 4, 4, 3, 4, 3, 3, 4, 5, 3, 3, 3, 4, 4, 3, 3, 3],
    },
  },
  {
    name: "Venice",
    layouts: {
      EASY: [3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 4],
      HARD: [3, 3, 3, 3, 3, 5, 4, 3, 3, 3, 3, 4, 3, 4, 3, 3, 3, 4],
    },
  },
  {
    name: "Viva Las Elvis",
    layouts: {
      EASY: [3, 3, 3, 3, 4, 4, 3, 3, 4, 3, 3, 3, 3, 2, 3, 3, 4, 3],
      HARD: [3, 3, 3, 4, 3, 4, 3, 3, 4, 3, 4, 4, 3, 3, 3, 3, 4, 3],
    },
  },
  {
    name: "Wallace & Gromit",
    layouts: {
      EASY: [3, 3, 3, 2, 4, 3, 3, 3, 4, 2, 2, 4, 3, 2, 3, 3, 3, 5],
      HARD: [2, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 2, 3, 4],
    },
  },
  {
    name: "Widows Walkabout",
    layouts: {
      EASY: [3, 3, 3, 3, 4, 4, 3, 3, 5, 3, 4, 3, 4, 4, 4, 2, 3, 4],
      HARD: [3, 3, 3, 3, 4, 4, 4, 3, 4, 3, 4, 3, 4, 4, 2, 2, 4, 3],
    },
  },
] as const;

function normalizeCourseName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"]/g, "")
    .trim();
}

async function seedPlayers() {
  for (const name of players) {
    await prisma.player.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedCourses() {
  for (const course of courseData) {
    const normalizedName = normalizeCourseName(course.name);

    const group = await prisma.courseGroup.upsert({
      where: { name: normalizedName },
      update: {},
      create: { name: normalizedName },
    });

    for (const [difficultyKey, pars] of Object.entries(course.layouts) as Array<
      [keyof typeof course.layouts, readonly number[]]
    >) {
      const difficulty = difficultyKey as Difficulty;
      const displayName = `${normalizedName} ${difficulty}`;

      const layout = await prisma.courseLayout.upsert({
        where: { displayName },
        update: {
          courseGroupId: group.id,
          difficulty,
        },
        create: {
          courseGroupId: group.id,
          difficulty,
          displayName,
        },
      });

      await prisma.hole.deleteMany({
        where: { courseLayoutId: layout.id },
      });

      await prisma.hole.createMany({
        data: pars.map((par, index) => ({
          courseLayoutId: layout.id,
          number: index + 1,
          par,
        })),
      });
    }
  }
}

async function main() {
  await seedPlayers();
  await seedCourses();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
