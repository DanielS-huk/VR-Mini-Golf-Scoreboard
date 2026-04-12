"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type RoundActionState = {
  error: string | null;
};

type SubmittedPlayerScores = {
  playerId: number;
  holes: Array<{
    holeId: number;
    strokes: number;
  }>;
};

type ValidatedRoundSubmission = {
  courseLayoutId: number;
  playedAt: Date;
  notes: string | null;
  submittedScores: SubmittedPlayerScores[];
  courseGroupId: number;
  difficulty: "EASY" | "HARD";
};

function invalidState(message: string): RoundActionState {
  return { error: message };
}

async function parseRoundSubmission(
  formData: FormData,
): Promise<ValidatedRoundSubmission | RoundActionState> {
  const courseLayoutId = Number(formData.get("courseLayoutId"));
  const playedAtRaw = formData.get("playedAt");
  const notesValue = formData.get("notes");
  const scoresRaw = formData.get("scores");

  if (!Number.isInteger(courseLayoutId) || courseLayoutId <= 0) {
    return invalidState("Select a valid course layout.");
  }

  if (typeof playedAtRaw !== "string" || playedAtRaw.length === 0) {
    return invalidState("Choose the date the round was played.");
  }

  const playedAt = new Date(`${playedAtRaw}T12:00:00`);
  if (Number.isNaN(playedAt.getTime())) {
    return invalidState("Enter a valid round date.");
  }

  if (typeof scoresRaw !== "string" || scoresRaw.length === 0) {
    return invalidState("Enter scores for every hole before saving.");
  }

  let submittedScores: SubmittedPlayerScores[];

  try {
    submittedScores = JSON.parse(scoresRaw) as SubmittedPlayerScores[];
  } catch {
    return invalidState("The submitted scorecard could not be read.");
  }

  if (!Array.isArray(submittedScores) || submittedScores.length === 0) {
    return invalidState("No player scores were submitted.");
  }

  const [layout, players] = await Promise.all([
    prisma.courseLayout.findUnique({
      where: { id: courseLayoutId },
      include: {
        holes: {
          orderBy: { number: "asc" },
        },
      },
    }),
    prisma.player.findMany(),
  ]);

  if (!layout) {
    return invalidState("The selected course layout no longer exists.");
  }

  const validPlayerIds = new Set(players.map((player) => player.id));
  const layoutHoleIds = new Set(layout.holes.map((hole) => hole.id));
  const expectedHoleCount = layout.holes.length;

  for (const playerScores of submittedScores) {
    if (!validPlayerIds.has(playerScores.playerId)) {
      return invalidState("One of the submitted players is invalid.");
    }

    if (!Array.isArray(playerScores.holes) || playerScores.holes.length !== expectedHoleCount) {
      return invalidState("Each player must have a score for every hole.");
    }

    const seenHoleIds = new Set<number>();

    for (const holeScore of playerScores.holes) {
      if (!layoutHoleIds.has(holeScore.holeId) || seenHoleIds.has(holeScore.holeId)) {
        return invalidState("The scorecard contains invalid hole data.");
      }

      if (!Number.isInteger(holeScore.strokes) || holeScore.strokes <= 0) {
        return invalidState("Hole scores must be positive whole numbers.");
      }

      seenHoleIds.add(holeScore.holeId);
    }
  }

  const submittedPlayerIds = new Set(submittedScores.map((playerScore) => playerScore.playerId));
  if (submittedPlayerIds.size !== submittedScores.length) {
    return invalidState("Duplicate players were submitted for the round.");
  }

  return {
    courseLayoutId,
    playedAt,
    notes: typeof notesValue === "string" && notesValue.trim() ? notesValue.trim() : null,
    submittedScores,
    courseGroupId: layout.courseGroupId,
    difficulty: layout.difficulty,
  };
}

async function writeRoundScores(
  roundId: number,
  submittedScores: SubmittedPlayerScores[],
  tx: Prisma.TransactionClient,
) {
  for (const playerScores of submittedScores) {
    const roundPlayer = await tx.roundPlayer.create({
      data: {
        roundId,
        playerId: playerScores.playerId,
      },
    });

    await tx.holeScore.createMany({
      data: playerScores.holes.map((holeScore) => ({
        roundPlayerId: roundPlayer.id,
        holeId: holeScore.holeId,
        strokes: holeScore.strokes,
      })),
    });
  }
}

function revalidateRoundViews(courseGroupId: number, difficulty: "EASY" | "HARD", roundId?: number) {
  revalidatePath("/");
  revalidatePath(`/courses/${courseGroupId}`);
  revalidatePath(`/courses/${courseGroupId}?difficulty=${difficulty}`);

  if (roundId) {
    revalidatePath(`/rounds/${roundId}/edit`);
  }
}

export async function createRound(
  _prevState: RoundActionState,
  formData: FormData,
): Promise<RoundActionState> {
  await requireAdmin("/rounds/new");

  const parsed = await parseRoundSubmission(formData);

  if ("error" in parsed) {
    return parsed;
  }

  const roundId = await prisma.$transaction(async (tx) => {
    const round = await tx.round.create({
      data: {
        courseLayoutId: parsed.courseLayoutId,
        playedAt: parsed.playedAt,
        notes: parsed.notes,
      },
    });

    await writeRoundScores(round.id, parsed.submittedScores, tx);

    return round.id;
  });

  revalidateRoundViews(parsed.courseGroupId, parsed.difficulty, roundId);
  redirect(`/courses/${parsed.courseGroupId}?difficulty=${parsed.difficulty}`);
}

export async function updateRound(
  roundId: number,
  _prevState: RoundActionState,
  formData: FormData,
): Promise<RoundActionState> {
  await requireAdmin(`/rounds/${roundId}/edit`);

  const parsedRoundId = Number(roundId);

  if (!Number.isInteger(parsedRoundId) || parsedRoundId <= 0) {
    return invalidState("The selected round is invalid.");
  }

  const parsed = await parseRoundSubmission(formData);

  if ("error" in parsed) {
    return parsed;
  }

  const existingRound = await prisma.round.findUnique({
    where: { id: parsedRoundId },
    include: {
      courseLayout: true,
    },
  });

  if (!existingRound) {
    return invalidState("This round no longer exists.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.roundPlayer.deleteMany({
      where: {
        roundId: parsedRoundId,
      },
    });

    await tx.round.update({
      where: { id: parsedRoundId },
      data: {
        courseLayoutId: parsed.courseLayoutId,
        playedAt: parsed.playedAt,
        notes: parsed.notes,
      },
    });

    await writeRoundScores(parsedRoundId, parsed.submittedScores, tx);
  });

  revalidateRoundViews(existingRound.courseLayout.courseGroupId, existingRound.courseLayout.difficulty, parsedRoundId);
  revalidateRoundViews(parsed.courseGroupId, parsed.difficulty, parsedRoundId);
  redirect(`/courses/${parsed.courseGroupId}?difficulty=${parsed.difficulty}`);
}

export async function deleteRound(roundId: number, redirectTo: string) {
  await requireAdmin(redirectTo);

  const parsedRoundId = Number(roundId);

  if (!Number.isInteger(parsedRoundId) || parsedRoundId <= 0) {
    throw new Error("Invalid round id.");
  }

  const round = await prisma.round.findUnique({
    where: { id: parsedRoundId },
    include: {
      courseLayout: true,
    },
  });

  if (!round) {
    redirect(redirectTo);
  }

  await prisma.round.delete({
    where: { id: parsedRoundId },
  });

  revalidateRoundViews(round.courseLayout.courseGroupId, round.courseLayout.difficulty, parsedRoundId);
  redirect(redirectTo);
}
