import fs from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function timestampLabel() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const data = {
    players: await prisma.player.findMany({ orderBy: { id: "asc" } }),
    courseGroups: await prisma.courseGroup.findMany({ orderBy: { id: "asc" } }),
    courseLayouts: await prisma.courseLayout.findMany({ orderBy: { id: "asc" } }),
    holes: await prisma.hole.findMany({
      orderBy: [{ courseLayoutId: "asc" }, { number: "asc" }],
    }),
    rounds: await prisma.round.findMany({ orderBy: { id: "asc" } }),
    roundPlayers: await prisma.roundPlayer.findMany({ orderBy: { id: "asc" } }),
    holeScores: await prisma.holeScore.findMany({ orderBy: { id: "asc" } }),
    exportedAt: new Date().toISOString(),
  };

  const backupDir = path.join(process.cwd(), "prisma", "backups");
  fs.mkdirSync(backupDir, { recursive: true });

  const timestampedPath = path.join(backupDir, `backup-${timestampLabel()}.json`);
  const latestPath = path.join(backupDir, "latest-backup.json");

  const serialized = JSON.stringify(data, null, 2);

  fs.writeFileSync(timestampedPath, serialized);
  fs.writeFileSync(latestPath, serialized);

  console.log(`Backup written to ${timestampedPath}`);
  console.log(`Latest backup updated at ${latestPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
