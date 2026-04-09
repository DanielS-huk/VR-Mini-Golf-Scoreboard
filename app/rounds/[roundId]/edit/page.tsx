import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateRound } from "@/app/rounds/new/actions";
import { RoundEntryForm } from "@/app/rounds/new/round-entry-form";

export default async function EditRoundPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const { roundId } = await params;
  const parsedRoundId = Number(roundId);

  if (!Number.isInteger(parsedRoundId) || parsedRoundId <= 0) {
    notFound();
  }

  const [layouts, players, round] = await Promise.all([
    prisma.courseLayout.findMany({
      include: {
        courseGroup: true,
        holes: {
          orderBy: {
            number: "asc",
          },
        },
      },
      orderBy: [{ difficulty: "asc" }, { courseGroup: { name: "asc" } }],
    }),
    prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.round.findUnique({
      where: { id: parsedRoundId },
      include: {
        courseLayout: {
          include: {
            holes: {
              orderBy: {
                number: "asc",
              },
            },
          },
        },
        players: {
          include: {
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
    }),
  ]);

  if (!round) {
    notFound();
  }

  const initialScores = Object.fromEntries(
    round.players.map((roundPlayer) => [
      roundPlayer.playerId,
      Object.fromEntries(
        roundPlayer.holeScores.map((holeScore) => [holeScore.holeId, String(holeScore.strokes)]),
      ),
    ]),
  );

  const boundUpdateRound = updateRound.bind(null, parsedRoundId);

  return (
    <main className="page-shell">
      <RoundEntryForm
        layouts={layouts}
        players={players}
        action={boundUpdateRound}
        initialSelectedLayoutId={String(round.courseLayoutId)}
        initialPlayedAt={round.playedAt.toISOString().slice(0, 10)}
        initialNotes={round.notes ?? ""}
        initialScoresByLayout={{
          [String(round.courseLayoutId)]: initialScores,
        }}
        heading="Edit Round"
        description=""
        submitLabel="Update round"
      />
    </main>
  );
}
