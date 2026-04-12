import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateRound } from "@/app/rounds/new/actions";
import { RoundEntryForm } from "@/app/rounds/new/round-entry-form";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type EditRoundPageProps = {
  params: Promise<{ roundId: string }>;
};

export default async function EditRoundPage({ params }: EditRoundPageProps) {
  const { roundId } = await params;
  await requireAdmin(`/rounds/${roundId}/edit`);
  const parsedRoundId = Number(roundId);

  if (!Number.isInteger(parsedRoundId) || parsedRoundId <= 0) {
    notFound();
  }

  const [round, layouts, players] = await Promise.all([
    prisma.round.findUnique({
      where: { id: parsedRoundId },
      include: {
        players: {
          include: {
            holeScores: {
              include: {
                hole: true,
              },
              orderBy: {
                hole: {
                  number: "asc",
                },
              },
            },
            player: true,
          },
        },
        courseLayout: {
          include: {
            holes: {
              orderBy: {
                number: "asc",
              },
            },
          },
        },
      },
    }),
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
  ]);

  if (!round) {
    notFound();
  }

  const initialScoresByLayout = {
    [round.courseLayoutId]: Object.fromEntries(
      round.players.map((roundPlayer) => [
        String(roundPlayer.playerId),
        Object.fromEntries(
          roundPlayer.holeScores.map((holeScore) => [String(holeScore.holeId), String(holeScore.strokes)]),
        ),
      ]),
    ),
  };

  return (
    <main className="page-shell">
      <RoundEntryForm
        layouts={layouts}
        players={players}
        action={updateRound.bind(null, round.id)}
        initialSelectedLayoutId={String(round.courseLayoutId)}
        initialPlayedAt={round.playedAt.toISOString().slice(0, 10)}
        initialNotes={round.notes ?? ""}
        initialScoresByLayout={initialScoresByLayout}
        heading="Edit Round"
        description=""
        submitLabel="Save changes"
      />
    </main>
  );
}
