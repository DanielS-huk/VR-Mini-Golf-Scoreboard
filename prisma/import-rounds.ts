import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RoundInput = {
  name: string;
  date: string;
  scores: {
    MIKE: number[];
    DAN: number[];
  };
};

const rounds: RoundInput[] = [
  {
    name: "Alfheim EASY",
    date: "2026-02-20",
    scores: {
      MIKE: [3, 3, 3, 2, 3, 3, 2, 3, 2, 3, 4, 4, 4, 3, 3, 2, 2, 2],
      DAN: [3, 2, 3, 2, 2, 2, 1, 2, 3, 2, 3, 3, 2, 2, 4, 2, 2, 2],
    },
  },
  {
    name: "Arizona Modern EASY",
    date: "2026-02-22",
    scores: {
      MIKE: [3, 3, 2, 4, 3, 2, 4, 3, 3, 3, 2, 4, 2, 3, 1, 2, 2, 2],
      DAN: [3, 2, 1, 3, 3, 3, 2, 5, 3, 3, 2, 4, 2, 2, 2, 2, 2, 5],
    },
  },
  {
    name: "Arizona Modern HARD",
    date: "2026-03-31",
    scores: {
      MIKE: [3, 2, 2, 4, 4, 3, 3, 7, 2, 3, 2, 4, 4, 4, 2, 2, 3, 4],
      DAN: [4, 2, 3, 6, 3, 3, 2, 3, 3, 4, 2, 4, 2, 4, 1, 4, 2, 4],
    },
  },
  {
    name: "Bogeys Bonanza EASY",
    date: "2026-02-23",
    scores: {
      MIKE: [2, 3, 3, 2, 2, 2, 3, 2, 4, 4, 3, 4, 3, 5, 5, 2, 2, 3],
      DAN: [2, 2, 4, 2, 2, 2, 2, 5, 3, 5, 1, 4, 2, 3, 3, 2, 1, 2],
    },
  },
  {
    name: "Bogeys Bonanza HARD",
    date: "2026-04-03",
    scores: {
      MIKE: [4, 4, 14, 4, 5, 3, 4, 4, 3, 4, 2, 4, 3, 3, 3, 7, 3, 10],
      DAN: [3, 2, 7, 6, 6, 1, 2, 5, 3, 8, 1, 4, 3, 2, 3, 2, 4, 5],
    },
  },
  {
    name: "Cherry Blossom EASY",
    date: "2026-03-21",
    scores: {
      MIKE: [2, 3, 2, 3, 2, 2, 2, 3, 3, 4, 3, 2, 2, 2, 2, 2, 2, 6],
      DAN: [2, 3, 2, 3, 2, 2, 2, 3, 2, 5, 2, 2, 2, 2, 2, 3, 1, 4],
    },
  },
  {
    name: "Cherry Blossom HARD",
    date: "2026-02-26",
    scores: {
      MIKE: [2, 5, 6, 4, 4, 4, 4, 3, 5, 6, 3, 3, 3, 4, 3, 7, 5, 9],
      DAN: [2, 4, 2, 3, 4, 3, 3, 3, 5, 6, 5, 6, 3, 3, 2, 2, 4, 4],
    },
  },
  {
    name: "Meow Wolf EASY",
    date: "2026-04-04",
    scores: {
      MIKE: [1, 2, 4, 4, 2, 3, 2, 3, 2, 2, 1, 2, 3, 3, 2, 3, 5, 3],
      DAN: [2, 2, 2, 3, 2, 3, 4, 4, 2, 3, 3, 2, 2, 3, 2, 2, 3, 2],
    },
  },
  {
    name: "Meow Wolf HARD",
    date: "2026-04-04",
    scores: {
      MIKE: [4, 2, 4, 2, 2, 6, 4, 4, 2, 2, 1, 3, 4, 2, 2, 5, 6, 1],
      DAN: [12, 2, 2, 4, 3, 3, 2, 4, 2, 3, 1, 6, 5, 1, 4, 4, 5, 1],
    },
  },
  {
    name: "Myst EASY",
    date: "2026-04-01",
    scores: {
      MIKE: [2, 2, 2, 3, 3, 2, 3, 2, 4, 2, 1, 3, 5, 2, 2, 1, 3, 3],
      DAN: [2, 2, 2, 3, 3, 2, 5, 2, 4, 2, 1, 2, 5, 2, 4, 1, 3, 3],
    },
  },
  {
    name: "Myst HARD",
    date: "2026-04-01",
    scores: {
      MIKE: [2, 3, 3, 2, 2, 3, 6, 2, 4, 2, 1, 4, 3, 3, 3, 2, 3, 4],
      DAN: [1, 2, 6, 2, 2, 3, 5, 3, 3, 2, 3, 3, 3, 3, 3, 3, 2, 4],
    },
  },
  {
    name: "Original Gothic EASY",
    date: "2026-03-15",
    scores: {
      MIKE: [1, 2, 3, 4, 1, 2, 2, 3, 2, 2, 4, 2, 2, 2, 2, 2, 2, 2],
      DAN: [1, 3, 2, 4, 2, 2, 3, 1, 2, 2, 3, 2, 2, 2, 2, 2, 3, 1],
    },
  },
  {
    name: "Original Gothic HARD",
    date: "2026-03-15",
    scores: {
      MIKE: [2, 4, 4, 5, 3, 2, 3, 3, 5, 4, 6, 3, 4, 3, 4, 6, 7, 7],
      DAN: [2, 2, 3, 3, 4, 2, 4, 3, 5, 4, 7, 3, 4, 3, 2, 4, 4, 2],
    },
  },
  {
    name: "Quixote Valley EASY",
    date: "2026-02-17",
    scores: {
      MIKE: [3, 2, 2, 3, 4, 2, 3, 2, 2, 2, 2, 4, 3, 3, 2, 3, 3, 3],
      DAN: [2, 2, 6, 5, 2, 3, 3, 2, 2, 2, 4, 3, 3, 5, 2, 2, 3, 3],
    },
  },
  {
    name: "Quixote Valley HARD",
    date: "2026-03-19",
    scores: {
      MIKE: [4, 4, 3, 3, 2, 3, 2, 6, 4, 7, 3, 3, 4, 5, 3, 2, 6, 3],
      DAN: [4, 4, 3, 3, 2, 4, 3, 3, 3, 2, 3, 2, 11, 4, 2, 2, 2, 2],
    },
  },
  {
    name: "Seagull Stacks EASY",
    date: "2026-02-21",
    scores: {
      MIKE: [2, 2, 2, 3, 2, 3, 3, 2, 2, 3, 2, 2, 3, 3, 5, 2, 2, 5],
      DAN: [3, 2, 2, 3, 2, 3, 3, 2, 2, 3, 2, 5, 3, 3, 5, 2, 1, 5],
    },
  },
  {
    name: "Seagull Stacks HARD",
    date: "2026-03-19",
    scores: {
      MIKE: [3, 4, 7, 3, 4, 5, 9, 3, 3, 8, 3, 2, 6, 2, 5, 4, 4, 8],
      DAN: [2, 4, 6, 2, 3, 3, 4, 2, 4, 4, 4, 3, 6, 3, 5, 2, 4, 5],
    },
  },
  {
    name: "Shangri-La EASY",
    date: "2026-03-14",
    scores: {
      MIKE: [3, 2, 2, 2, 3, 2, 3, 5, 5, 2, 2, 5, 3, 5, 2, 2, 4, 5],
      DAN: [1, 3, 2, 2, 4, 3, 5, 2, 3, 3, 2, 7, 5, 5, 2, 2, 2, 13],
    },
  },
  {
    name: "Shangri-La HARD",
    date: "2026-04-03",
    scores: {
      MIKE: [4, 4, 2, 2, 2, 4, 3, 3, 2, 3, 2, 3, 4, 8, 3, 2, 4, 8],
      DAN: [5, 2, 2, 3, 3, 6, 4, 5, 3, 3, 3, 2, 1, 5, 2, 3, 3, 6],
    },
  },
  {
    name: "Sweetopia EASY",
    date: "2026-02-19",
    scores: {
      MIKE: [2, 3, 3, 2, 6, 2, 3, 3, 2, 2, 3, 2, 2, 2, 3, 3, 2, 3],
      DAN: [2, 2, 4, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 3, 2, 4, 3],
    },
  },
  {
    name: "Sweetopia HARD",
    date: "2026-03-21",
    scores: {
      MIKE: [3, 2, 4, 3, 2, 3, 3, 3, 4, 3, 6, 3, 3, 5, 4, 4, 3, 3],
      DAN: [3, 2, 4, 4, 3, 3, 5, 3, 4, 4, 4, 4, 3, 4, 7, 3, 5, 2],
    },
  },
  {
    name: "Tethys Station EASY",
    date: "2026-02-25",
    scores: {
      MIKE: [2, 3, 2, 4, 3, 2, 2, 7, 3, 2, 2, 3, 2, 3, 3, 2, 6, 4],
      DAN: [2, 2, 3, 3, 4, 2, 3, 4, 2, 4, 7, 3, 3, 4, 2, 2, 7, 2],
    },
  },
  {
    name: "Tethys Station HARD",
    date: "2026-03-30",
    scores: {
      MIKE: [2, 3, 3, 5, 3, 2, 4, 7, 4, 3, 3, 2, 3, 3, 3, 3, 5, 4],
      DAN: [2, 4, 3, 2, 3, 2, 4, 6, 3, 4, 4, 2, 7, 3, 7, 3, 7, 4],
    },
  },
  {
    name: "Tourist Trap EASY",
    date: "2026-02-17",
    scores: {
      MIKE: [2, 2, 2, 3, 2, 2, 3, 3, 3, 2, 2, 2, 3, 2, 3, 1, 3, 7],
      DAN: [2, 2, 2, 2, 2, 2, 3, 3, 2, 3, 2, 2, 2, 3, 2, 2, 2, 4],
    },
  },
  {
    name: "Tourist Trap HARD",
    date: "2026-03-17",
    scores: {
      MIKE: [2, 3, 3, 3, 4, 6, 3, 3, 6, 3, 2, 2, 7, 3, 4, 3, 3, 5],
      DAN: [2, 2, 5, 3, 3, 3, 3, 3, 5, 5, 3, 4, 3, 4, 4, 3, 2, 3],
    },
  },
  {
    name: "Upside Town EASY",
    date: "2026-02-20",
    scores: {
      MIKE: [2, 3, 3, 3, 2, 4, 2, 3, 3, 4, 3, 2, 3, 2, 2, 4, 5, 3],
      DAN: [2, 3, 3, 3, 2, 4, 2, 3, 3, 3, 5, 2, 3, 2, 2, 2, 2, 2],
    },
  },
  {
    name: "Upside Town HARD",
    date: "2026-02-26",
    scores: {
      MIKE: [3, 4, 4, 4, 5, 3, 5, 3, 3, 4, 4, 3, 5, 4, 5, 6, 3, 2],
      DAN: [3, 6, 2, 4, 3, 3, 1, 1, 6, 5, 3, 4, 3, 4, 5, 4, 2, 3],
    },
  },
  {
    name: "Viva Las Elvis EASY",
    date: "2026-03-21",
    scores: {
      MIKE: [2, 2, 2, 2, 3, 4, 3, 3, 4, 2, 2, 3, 2, 3, 3, 3, 3, 2],
      DAN: [2, 4, 2, 4, 3, 4, 3, 4, 3, 4, 3, 4, 2, 3, 3, 2, 3, 4],
    },
  },
  {
    name: "Viva Las Elvis HARD",
    date: "2026-03-21",
    scores: {
      MIKE: [2, 2, 4, 4, 2, 4, 3, 5, 5, 4, 3, 4, 3, 2, 2, 3, 4, 8],
      DAN: [4, 2, 2, 5, 3, 3, 4, 2, 5, 3, 3, 5, 3, 3, 2, 4, 3, 2],
    },
  },
  {
    name: "Wallace & Gromit HARD",
    date: "2026-03-13",
    scores: {
      MIKE: [2, 2, 5, 3, 3, 4, 3, 3, 5, 5, 4, 2, 4, 7, 2, 4, 4, 5],
      DAN: [9, 2, 3, 3, 3, 3, 3, 3, 3, 1, 4, 3, 2, 2, 3, 4, 3, 7],
    },
  },
];

function normalizeCourseName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"]/g, "")
    .trim();
}

function parseLayoutName(name: string) {
  const match = name.match(/^(.*)\s+(EASY|HARD)$/);
  if (!match) {
    throw new Error(`Invalid layout name: ${name}`);
  }

  return {
    courseGroupName: normalizeCourseName(match[1]),
    difficulty: match[2] as "EASY" | "HARD",
  };
}

function sameScores(existing: number[], incoming: number[]) {
  return existing.length === incoming.length && existing.every((value, index) => value === incoming[index]);
}

async function main() {
  const players = await prisma.player.findMany({
    where: { name: { in: ["Dan", "Mike"] } },
  });

  const playerIds = new Map(players.map((player) => [player.name.toUpperCase(), player.id]));
  if (!playerIds.has("DAN") || !playerIds.has("MIKE")) {
    throw new Error("Dan and Mike must exist before importing rounds.");
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const roundInput of rounds) {
    const { courseGroupName, difficulty } = parseLayoutName(roundInput.name);
    const layout = await prisma.courseLayout.findFirst({
      where: {
        difficulty,
        courseGroup: {
          name: courseGroupName,
        },
      },
      include: {
        holes: {
          orderBy: { number: "asc" },
        },
      },
    });

    if (!layout) {
      throw new Error(`Layout not found: ${roundInput.name}`);
    }

    if (
      layout.holes.length !== roundInput.scores.DAN.length ||
      layout.holes.length !== roundInput.scores.MIKE.length
    ) {
      throw new Error(`Score count does not match hole count for ${roundInput.name}`);
    }

    const playedAt = new Date(`${roundInput.date}T12:00:00`);
    const dayStart = new Date(`${roundInput.date}T00:00:00`);
    const dayEnd = new Date(`${roundInput.date}T23:59:59.999`);

    const existingRounds = await prisma.round.findMany({
      where: {
        courseLayoutId: layout.id,
        playedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        players: {
          include: {
            player: true,
            holeScores: {
              orderBy: {
                hole: {
                  number: "asc",
                },
              },
            },
          },
        },
      },
    });

    const duplicate = existingRounds.some((existingRound) => {
      const danScores =
        existingRound.players.find((player) => player.player.name === "Dan")?.holeScores.map((score) => score.strokes) ??
        [];
      const mikeScores =
        existingRound.players.find((player) => player.player.name === "Mike")?.holeScores.map((score) => score.strokes) ??
        [];

      return (
        sameScores(danScores, roundInput.scores.DAN) &&
        sameScores(mikeScores, roundInput.scores.MIKE)
      );
    });

    if (duplicate) {
      skippedCount += 1;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const round = await tx.round.create({
        data: {
          courseLayoutId: layout.id,
          playedAt,
        },
      });

      const danRoundPlayer = await tx.roundPlayer.create({
        data: {
          roundId: round.id,
          playerId: playerIds.get("DAN")!,
        },
      });

      const mikeRoundPlayer = await tx.roundPlayer.create({
        data: {
          roundId: round.id,
          playerId: playerIds.get("MIKE")!,
        },
      });

      await tx.holeScore.createMany({
        data: layout.holes.flatMap((hole, index) => [
          {
            roundPlayerId: danRoundPlayer.id,
            holeId: hole.id,
            strokes: roundInput.scores.DAN[index],
          },
          {
            roundPlayerId: mikeRoundPlayer.id,
            holeId: hole.id,
            strokes: roundInput.scores.MIKE[index],
          },
        ]),
      });
    });

    createdCount += 1;
  }

  console.log(`Created ${createdCount} rounds; skipped ${skippedCount} duplicates.`);
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
