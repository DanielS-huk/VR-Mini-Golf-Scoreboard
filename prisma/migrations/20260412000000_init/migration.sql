-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'HARD');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLayout" (
    "id" SERIAL NOT NULL,
    "courseGroupId" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hole" (
    "id" SERIAL NOT NULL,
    "courseLayoutId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "courseLayoutId" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundPlayer" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoundPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoleScore" (
    "id" SERIAL NOT NULL,
    "roundPlayerId" INTEGER NOT NULL,
    "holeId" INTEGER NOT NULL,
    "strokes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoleScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseGroup_name_key" ON "CourseGroup"("name");

-- CreateIndex
CREATE INDEX "CourseLayout_difficulty_idx" ON "CourseLayout"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLayout_courseGroupId_difficulty_key" ON "CourseLayout"("courseGroupId", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLayout_displayName_key" ON "CourseLayout"("displayName");

-- CreateIndex
CREATE INDEX "Hole_courseLayoutId_idx" ON "Hole"("courseLayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Hole_courseLayoutId_number_key" ON "Hole"("courseLayoutId", "number");

-- CreateIndex
CREATE INDEX "Round_courseLayoutId_playedAt_idx" ON "Round"("courseLayoutId", "playedAt");

-- CreateIndex
CREATE INDEX "Round_playedAt_idx" ON "Round"("playedAt");

-- CreateIndex
CREATE INDEX "RoundPlayer_playerId_idx" ON "RoundPlayer"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundPlayer_roundId_playerId_key" ON "RoundPlayer"("roundId", "playerId");

-- CreateIndex
CREATE INDEX "HoleScore_holeId_idx" ON "HoleScore"("holeId");

-- CreateIndex
CREATE UNIQUE INDEX "HoleScore_roundPlayerId_holeId_key" ON "HoleScore"("roundPlayerId", "holeId");

-- AddForeignKey
ALTER TABLE "CourseLayout" ADD CONSTRAINT "CourseLayout_courseGroupId_fkey" FOREIGN KEY ("courseGroupId") REFERENCES "CourseGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hole" ADD CONSTRAINT "Hole_courseLayoutId_fkey" FOREIGN KEY ("courseLayoutId") REFERENCES "CourseLayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_courseLayoutId_fkey" FOREIGN KEY ("courseLayoutId") REFERENCES "CourseLayout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundPlayer" ADD CONSTRAINT "RoundPlayer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundPlayer" ADD CONSTRAINT "RoundPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_roundPlayerId_fkey" FOREIGN KEY ("roundPlayerId") REFERENCES "RoundPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
