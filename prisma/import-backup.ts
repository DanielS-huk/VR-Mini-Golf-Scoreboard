import fs from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type BackupData = {
  players: Array<{ id: number; name: string; createdAt: string; updatedAt: string }>;
  courseGroups: Array<{ id: number; name: string; createdAt: string; updatedAt: string }>;
  courseLayouts: Array<{
    id: number;
    courseGroupId: number;
    difficulty: "EASY" | "HARD";
    displayName: string;
    createdAt: string;
    updatedAt: string;
  }>;
  holes: Array<{
    id: number;
    courseLayoutId: number;
    number: number;
    par: number;
    createdAt: string;
    updatedAt: string;
  }>;
  rounds: Array<{
    id: number;
    courseLayoutId: number;
    playedAt: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  roundPlayers: Array<{
    id: number;
    roundId: number;
    playerId: number;
    createdAt: string;
    updatedAt: string;
  }>;
  holeScores: Array<{
    id: number;
    roundPlayerId: number;
    holeId: number;
    strokes: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

const backupPath = path.join(process.cwd(), "prisma", "backups", "sqlite-export.json");

function loadBackup(): BackupData {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found at ${backupPath}`);
  }

  return JSON.parse(fs.readFileSync(backupPath, "utf8")) as BackupData;
}

async function ensureDatabaseIsEmpty() {
  const counts = await Promise.all([
    prisma.player.count(),
    prisma.courseGroup.count(),
    prisma.courseLayout.count(),
    prisma.hole.count(),
    prisma.round.count(),
    prisma.roundPlayer.count(),
    prisma.holeScore.count(),
  ]);

  if (counts.some((count) => count > 0)) {
    throw new Error(
      "The target database is not empty. Import into a fresh Postgres database to avoid duplicate or conflicting records.",
    );
  }
}

async function resetSequence(tableName: string) {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"${tableName}"', 'id'),
      COALESCE((SELECT MAX(id) FROM "${tableName}"), 1),
      (SELECT COUNT(*) > 0 FROM "${tableName}")
    );
  `);
}

async function main() {
  const backup = loadBackup();
  await ensureDatabaseIsEmpty();

  await prisma.player.createMany({
    data: backup.players.map((player) => ({
      ...player,
      createdAt: new Date(player.createdAt),
      updatedAt: new Date(player.updatedAt),
    })),
  });

  await prisma.courseGroup.createMany({
    data: backup.courseGroups.map((courseGroup) => ({
      ...courseGroup,
      createdAt: new Date(courseGroup.createdAt),
      updatedAt: new Date(courseGroup.updatedAt),
    })),
  });

  await prisma.courseLayout.createMany({
    data: backup.courseLayouts.map((layout) => ({
      ...layout,
      createdAt: new Date(layout.createdAt),
      updatedAt: new Date(layout.updatedAt),
    })),
  });

  await prisma.hole.createMany({
    data: backup.holes.map((hole) => ({
      ...hole,
      createdAt: new Date(hole.createdAt),
      updatedAt: new Date(hole.updatedAt),
    })),
  });

  await prisma.round.createMany({
    data: backup.rounds.map((round) => ({
      ...round,
      playedAt: new Date(round.playedAt),
      createdAt: new Date(round.createdAt),
      updatedAt: new Date(round.updatedAt),
    })),
  });

  await prisma.roundPlayer.createMany({
    data: backup.roundPlayers.map((roundPlayer) => ({
      ...roundPlayer,
      createdAt: new Date(roundPlayer.createdAt),
      updatedAt: new Date(roundPlayer.updatedAt),
    })),
  });

  await prisma.holeScore.createMany({
    data: backup.holeScores.map((holeScore) => ({
      ...holeScore,
      createdAt: new Date(holeScore.createdAt),
      updatedAt: new Date(holeScore.updatedAt),
    })),
  });

  for (const tableName of [
    "Player",
    "CourseGroup",
    "CourseLayout",
    "Hole",
    "Round",
    "RoundPlayer",
    "HoleScore",
  ]) {
    await resetSequence(tableName);
  }

  console.log("Imported SQLite backup into Postgres successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
