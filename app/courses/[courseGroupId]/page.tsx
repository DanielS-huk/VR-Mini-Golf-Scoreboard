import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRoundButton } from "@/app/rounds/delete-round-button";
import { LogoutButton } from "@/app/auth/logout-button";
import { deleteRound } from "@/app/rounds/new/actions";
import { getCourseDisplayName, getLayoutDisplayName } from "@/lib/course-display";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CoursePageProps = {
  params: Promise<{ courseGroupId: string }>;
  searchParams?: Promise<{ difficulty?: string }>;
};

function getNotation(strokes: number, par: number) {
  const delta = strokes - par;

  if (delta === 0) {
    return null;
  }

  if (delta < 0) {
    return {
      shape: "circle" as const,
      depth: Math.min(Math.abs(delta), 3),
    };
  }

  return {
    shape: "square" as const,
    depth: Math.min(delta, 3),
  };
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { courseGroupId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const parsedCourseGroupId = Number(courseGroupId);

  if (!Number.isInteger(parsedCourseGroupId) || parsedCourseGroupId <= 0) {
    notFound();
  }

  const selectedDifficulty = resolvedSearchParams?.difficulty === "HARD" ? "HARD" : "EASY";

  const [courseGroup, isAdmin] = await Promise.all([
    prisma.courseGroup.findUnique({
    where: { id: parsedCourseGroupId },
    include: {
      layouts: {
        include: {
          holes: {
            orderBy: {
              number: "asc",
            },
          },
          rounds: {
            include: {
              players: {
                include: {
                  player: true,
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
                },
                orderBy: {
                  player: {
                    name: "asc",
                  },
                },
              },
            },
            orderBy: {
              playedAt: "desc",
            },
          },
        },
        orderBy: {
          difficulty: "asc",
        },
      },
    },
    }),
    isAdminAuthenticated(),
  ]);

  if (!courseGroup) {
    notFound();
  }

  const layout = courseGroup.layouts.find((entry) => entry.difficulty === selectedDifficulty);

  if (!layout) {
    notFound();
  }

  const totalPar = layout.holes.reduce((sum, hole) => sum + hole.par, 0);

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Course History</p>
        <h1>{getCourseDisplayName(courseGroup.name)}</h1>
        <div className="detail-links">
          <Link className="text-link" href="/">
            Return home
          </Link>
          {isAdmin ? (
            <>
              <Link className="primary-button" href={`/rounds/new?layoutId=${layout.id}`}>
                Enter a round
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link className="text-link" href={`/login?next=${encodeURIComponent(`/courses/${courseGroup.id}?difficulty=${selectedDifficulty}`)}`}>
              Admin login
            </Link>
          )}
        </div>
      </section>

      <section className="difficulty-toggle" aria-label="Difficulty toggle">
        <Link
          className={`toggle-chip ${selectedDifficulty === "EASY" ? "is-active" : ""}`}
          href={`/courses/${courseGroup.id}?difficulty=EASY`}
        >
          Easy
        </Link>
        <Link
          className={`toggle-chip ${selectedDifficulty === "HARD" ? "is-active" : ""}`}
          href={`/courses/${courseGroup.id}?difficulty=HARD`}
        >
          Hard
        </Link>
      </section>

      <section
        className={`round-history ${selectedDifficulty === "EASY" ? "theme-easy" : "theme-hard"}`}
      >
        {layout.rounds.length === 0 ? (
          <p className="empty-state">
            No {selectedDifficulty.toLowerCase()} rounds have been recorded for this course yet.
          </p>
        ) : (
          layout.rounds.map((round) => {
            const holeScoreMap = new Map(
              round.players.map((roundPlayer) => [
                roundPlayer.playerId,
                new Map(roundPlayer.holeScores.map((score) => [score.holeId, score.strokes])),
              ]),
            );
            const playerTotals = new Map(
              round.players.map((roundPlayer) => [
                roundPlayer.playerId,
                roundPlayer.holeScores.reduce((sum, score) => sum + score.strokes, 0),
              ]),
            );
            const winningTotal = Math.min(...Array.from(playerTotals.values()));
            const winnerCount = Array.from(playerTotals.values()).filter(
              (total) => total === winningTotal,
            ).length;

            return (
              <article key={round.id} className="spreadsheet-card">
                <div className="spreadsheet-header">
                  <div>
                    <p className="eyebrow">{getLayoutDisplayName(layout.displayName)}</p>
                    <h2>{round.playedAt.toLocaleDateString()}</h2>
                    <p className="round-card-copy">{round.notes ?? ""}</p>
                  </div>
                  <div className="card-actions">
                    {isAdmin ? (
                      <>
                        <Link className="text-link" href={`/rounds/${round.id}/edit`}>
                          Edit
                        </Link>
                        <DeleteRoundButton
                          action={deleteRound.bind(
                            null,
                            round.id,
                            `/courses/${courseGroup.id}?difficulty=${selectedDifficulty}`,
                          )}
                          className="danger-button"
                        />
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="spreadsheet-wrap">
                  <table className="spreadsheet-table">
                    <tbody>
                      <tr>
                        <th>Hole</th>
                        {layout.holes.map((hole) => (
                          <td key={`hole-${round.id}-${hole.id}`}>{hole.number}</td>
                        ))}
                        <td className="total-cell">Total</td>
                      </tr>
                      <tr className="par-row">
                        <th>Par</th>
                        {layout.holes.map((hole) => (
                          <td key={`par-${round.id}-${hole.id}`}>{hole.par}</td>
                        ))}
                        <td className="total-cell">{totalPar}</td>
                      </tr>
                      {round.players.map((roundPlayer) => {
                        const total = playerTotals.get(roundPlayer.playerId) ?? 0;
                        const isWinner = winnerCount === 1 && total === winningTotal;

                        return (
                          <tr key={roundPlayer.id}>
                            <th>
                              <span className="player-label">
                                <span>{roundPlayer.player.name}</span>
                                {isWinner ? (
                                  <span className="winner-badge" aria-label="Round winner">
                                    <span className="winner-check" />
                                  </span>
                                ) : null}
                              </span>
                            </th>
                            {layout.holes.map((hole) => {
                              const strokes =
                                holeScoreMap.get(roundPlayer.playerId)?.get(hole.id) ?? null;
                              const notation = strokes === null ? null : getNotation(strokes, hole.par);

                              return (
                                <td key={`score-${roundPlayer.id}-${hole.id}`}>
                                  {strokes === null ? (
                                    "-"
                                  ) : notation ? (
                                    <span
                                      className={`score-notation ${notation.shape} depth-${notation.depth}`}
                                    >
                                      {strokes}
                                    </span>
                                  ) : (
                                    strokes
                                  )}
                                </td>
                              );
                            })}
                            <td className="total-cell">{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
