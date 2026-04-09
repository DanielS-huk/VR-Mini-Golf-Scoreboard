import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRoundButton } from "@/app/rounds/delete-round-button";
import { deleteRound } from "@/app/rounds/new/actions";
import { getCourseDisplayName, getLayoutDisplayName } from "@/lib/course-display";
import { prisma } from "@/lib/prisma";

function formatVsPar(total: number) {
  if (total === 0) {
    return "E";
  }

  return total > 0 ? `+${total}` : `${total}`;
}

export default async function RoundDetailPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const { roundId } = await params;
  const parsedRoundId = Number(roundId);

  if (!Number.isInteger(parsedRoundId) || parsedRoundId <= 0) {
    notFound();
  }

  const round = await prisma.round.findUnique({
    where: { id: parsedRoundId },
    include: {
      courseLayout: {
        include: {
          courseGroup: true,
          holes: {
            orderBy: {
              number: "asc",
            },
          },
        },
      },
      players: {
        include: {
          player: true,
          holeScores: {
            include: {
              hole: true,
            },
          },
        },
        orderBy: {
          player: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!round) {
    notFound();
  }

  const totalPar = round.courseLayout.holes.reduce((sum, hole) => sum + hole.par, 0);
  const holeScoreMap = new Map(
    round.players.map((roundPlayer) => [
      roundPlayer.playerId,
      new Map(roundPlayer.holeScores.map((score) => [score.holeId, score.strokes])),
    ]),
  );
  const deleteAction = deleteRound.bind(
    null,
    round.id,
    `/courses/${round.courseLayout.courseGroup.id}?difficulty=${round.courseLayout.difficulty}`,
  );

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Round Saved</p>
        <h1>{getLayoutDisplayName(round.courseLayout.displayName)}</h1>
        <p className="hero-copy">
          Played on {round.playedAt.toLocaleDateString()}.
          {round.notes ? ` ${round.notes}` : ""}
        </p>
        <div className="detail-links">
          <Link className="text-link" href={`/rounds/${round.id}/edit`}>
            Edit round
          </Link>
          <Link className="text-link" href="/rounds/new">
            Enter another round
          </Link>
          <DeleteRoundButton action={deleteAction} />
          <Link className="text-link" href="/">
            Return home
          </Link>
        </div>
      </section>

      <section className="scorecard-shell">
        <div className="scorecard-summary">
          <div>
            <span className="stat-label">Course</span>
            <strong>{getCourseDisplayName(round.courseLayout.courseGroup.name)}</strong>
          </div>
          <div>
            <span className="stat-label">Difficulty</span>
            <strong>{round.courseLayout.difficulty}</strong>
          </div>
          <div>
            <span className="stat-label">Par</span>
            <strong>{totalPar}</strong>
          </div>
        </div>

        <div className="scorecard-table-wrap">
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Hole</th>
                <th>Par</th>
                {round.players.map((roundPlayer) => (
                  <th key={roundPlayer.id}>{roundPlayer.player.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {round.courseLayout.holes.map((hole) => (
                <tr key={hole.id}>
                  <td>{hole.number}</td>
                  <td>{hole.par}</td>
                  {round.players.map((roundPlayer) => (
                    <td key={roundPlayer.id}>
                      {holeScoreMap.get(roundPlayer.playerId)?.get(hole.id) ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th>{totalPar}</th>
                {round.players.map((roundPlayer) => {
                  const total = roundPlayer.holeScores.reduce((sum, score) => sum + score.strokes, 0);
                  return <th key={roundPlayer.id}>{total}</th>;
                })}
              </tr>
              <tr>
                <th>Vs Par</th>
                <th>E</th>
                {round.players.map((roundPlayer) => {
                  const total = roundPlayer.holeScores.reduce((sum, score) => sum + score.strokes, 0);
                  return <th key={roundPlayer.id}>{formatVsPar(total - totalPar)}</th>;
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </main>
  );
}
