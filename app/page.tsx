import Link from "next/link";
import { getCourseDisplayName } from "@/lib/course-display";
import { LogoutButton } from "@/app/auth/logout-button";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const courseDisplayOrder = [
  "Tourist Trap",
  "Cherry Blossom",
  "Seagull Stacks",
  "Arizona Modern",
  "Original Gothic",
  "Bogeys Bonanza",
  "Tethys Station",
  "Quixote Valley",
  "Shangri-La",
  "Sweetopia",
  "20,000 Leagues",
  "Upside Town",
  "Laser Lair",
  "Alfheim",
  "Gardens Of Babylon",
  "Labyrinth",
  "El Dorado",
  "Myst",
  "Temple at Zerzura",
  "Atlantis",
  "Ice Lair",
  "8-Bit Lair",
  "Widows Walkabout",
  "Meow Wolf",
  "Mars Gardens",
  "Viva Las Elvis",
  "Around the World",
  "Center of the Earth",
  "Venice",
  "Wallace & Gromit",
  "Holiday Hideaway",
  "Mount Olympus",
  "Raptor Cliffs",
  "Crystal Lair",
  "Tokyo",
  "Forgotten Fairyland",
  "Alice in Wonderland",
  "Tiki a Coco",
  "Hollywood",
] as const;

function normalizeForOrdering(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const courseOrderLookup = new Map(
  courseDisplayOrder.map((name, index) => [normalizeForOrdering(name), index]),
);

function formatVsPar(total: number | null) {
  if (total === null) {
    return "";
  }

  if (total === 0) {
    return "E";
  }

  return total > 0 ? `+${total}` : `${total}`;
}

type DifficultyKey = "EASY" | "HARD";

type DifficultyStats = {
  bestVsParByPlayer: Map<number, number | null>;
  acesByPlayer: Map<number, number>;
  roundsPlayed: number;
};

function getScoreClass(value: number | null, values: Array<number | null>) {
  if (value === null) {
    return "";
  }

  const presentValues = values.filter((entry): entry is number => entry !== null);
  if (presentValues.length < 2) {
    return "";
  }

  const best = Math.min(...presentValues);
  const worst = Math.max(...presentValues);

  if (best === worst) {
    return "";
  }

  if (value === best) {
    return "score-good";
  }

  if (value === worst) {
    return "score-bad";
  }

  return "";
}

function getCourseSortIndex(name: string) {
  const normalized = normalizeForOrdering(name);
  const normalizedWords = normalized.split(" ");

  for (const [label, index] of courseOrderLookup) {
    const labelWords = label.split(" ");
    let wordIndex = 0;

    for (const word of normalizedWords) {
      if (word === labelWords[wordIndex]) {
        wordIndex += 1;
      }
    }

    if (
      normalized === label ||
      normalized.startsWith(label) ||
      label.startsWith(normalized) ||
      normalized.includes(label) ||
      label.includes(normalized) ||
      wordIndex === labelWords.length
    ) {
      return index;
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

export default async function HomePage() {
  const [courseGroups, players, isAdmin] = await Promise.all([
    prisma.courseGroup.findMany({
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
                    holeScores: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    isAdminAuthenticated(),
  ]);
  const [firstPlayer, secondPlayer] = players;

  const rows = courseGroups.map((courseGroup) => {
    const byDifficulty = {
      EASY: {
        bestVsParByPlayer: new Map<number, number | null>(),
        acesByPlayer: new Map<number, number>(),
        roundsPlayed: 0,
      },
      HARD: {
        bestVsParByPlayer: new Map<number, number | null>(),
        acesByPlayer: new Map<number, number>(),
        roundsPlayed: 0,
      },
    } satisfies Record<DifficultyKey, DifficultyStats>;

    for (const player of players) {
      byDifficulty.EASY.bestVsParByPlayer.set(player.id, null);
      byDifficulty.HARD.bestVsParByPlayer.set(player.id, null);
      byDifficulty.EASY.acesByPlayer.set(player.id, 0);
      byDifficulty.HARD.acesByPlayer.set(player.id, 0);
    }

    for (const layout of courseGroup.layouts) {
      const difficulty = layout.difficulty as DifficultyKey;
      const totalPar = layout.holes.reduce((sum, hole) => sum + hole.par, 0);
      byDifficulty[difficulty].roundsPlayed += layout.rounds.length;

      for (const round of layout.rounds) {
        for (const roundPlayer of round.players) {
            const totalScore = roundPlayer.holeScores.reduce((sum, score) => sum + score.strokes, 0);
            const vsPar = totalScore - totalPar;
            const bestSoFar =
              byDifficulty[difficulty].bestVsParByPlayer.get(roundPlayer.playerId) ?? null;

          if (bestSoFar === null || vsPar < bestSoFar) {
            byDifficulty[difficulty].bestVsParByPlayer.set(roundPlayer.playerId, vsPar);
          }

          const aces = roundPlayer.holeScores.reduce((sum, score) => {
            return sum + (score.strokes === 1 ? 1 : 0);
          }, 0);

          byDifficulty[difficulty].acesByPlayer.set(
            roundPlayer.playerId,
            (byDifficulty[difficulty].acesByPlayer.get(roundPlayer.playerId) ?? 0) + aces,
          );
        }
      }
    }

    return {
      id: courseGroup.id,
      name: getCourseDisplayName(courseGroup.name),
      easy: byDifficulty.EASY,
      hard: byDifficulty.HARD,
    };
  }).sort((left, right) => {
    const leftIndex = getCourseSortIndex(left.name);
    const rightIndex = getCourseSortIndex(right.name);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.name.localeCompare(right.name);
  });

  const personalBestTotalsByPlayer = new Map<number, number | null>();
  const personalBestTotalsByDifficulty = {
    EASY: new Map<number, number | null>(),
    HARD: new Map<number, number | null>(),
  } satisfies Record<DifficultyKey, Map<number, number | null>>;
  const totalWinsByDifficulty = {
    EASY: new Map<number, number>(),
    HARD: new Map<number, number>(),
  } satisfies Record<DifficultyKey, Map<number, number>>;

  for (const player of players) {
    totalWinsByDifficulty.EASY.set(player.id, 0);
    totalWinsByDifficulty.HARD.set(player.id, 0);
  }

  for (const player of players) {
    let total = 0;
    let hasAnyScores = false;
    let easyTotal = 0;
    let easyHasAnyScores = false;
    let hardTotal = 0;
    let hardHasAnyScores = false;

    for (const row of rows) {
      const easyValue = row.easy.bestVsParByPlayer.get(player.id) ?? null;
      const hardValue = row.hard.bestVsParByPlayer.get(player.id) ?? null;

      if (easyValue !== null) {
        total += easyValue;
        hasAnyScores = true;
        easyTotal += easyValue;
        easyHasAnyScores = true;
      }

      if (hardValue !== null) {
        total += hardValue;
        hasAnyScores = true;
        hardTotal += hardValue;
        hardHasAnyScores = true;
      }
    }

    personalBestTotalsByPlayer.set(player.id, hasAnyScores ? total : null);
    personalBestTotalsByDifficulty.EASY.set(player.id, easyHasAnyScores ? easyTotal : null);
    personalBestTotalsByDifficulty.HARD.set(player.id, hardHasAnyScores ? hardTotal : null);
  }

  for (const courseGroup of courseGroups) {
    for (const layout of courseGroup.layouts) {
      const difficulty = layout.difficulty as DifficultyKey;

      for (const round of layout.rounds) {
        const playerTotals = round.players.map((roundPlayer) => ({
          playerId: roundPlayer.playerId,
          total: roundPlayer.holeScores.reduce((sum, score) => sum + score.strokes, 0),
        }));

        if (playerTotals.length < 2) {
          continue;
        }

        const bestTotal = Math.min(...playerTotals.map((entry) => entry.total));
        const winners = playerTotals.filter((entry) => entry.total === bestTotal);

        if (winners.length !== 1) {
          continue;
        }

        const winner = winners[0];
        totalWinsByDifficulty[difficulty].set(
          winner.playerId,
          (totalWinsByDifficulty[difficulty].get(winner.playerId) ?? 0) + 1,
        );
      }
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Walkabout Golf VR</p>
        <h1>Match Scoreboard</h1>
        <p className="hero-copy">
          
        </p>
        <div className="detail-links">
          {isAdmin ? (
            <>
              <Link className="primary-button" href="/rounds/new">
                Enter a round
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link className="text-link" href="/login">
              Admin login
            </Link>
          )}
        </div>
      </section>

      <section className="scoreboard-shell">
        <div className="scoreboard-scroll">
          <table className="scoreboard-table">
            <colgroup>
              <col className="col-course" />
              <col className="col-score" />
              <col className="col-score" />
              <col className="col-rounds" />
              <col className="col-score" />
              <col className="col-score" />
              <col className="col-rounds" />
              <col className="col-aces" />
              <col className="col-aces" />
              <col className="col-aces" />
              <col className="col-aces" />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={3}>Course</th>
                <th colSpan={players.length + 1}>Easy</th>
                <th colSpan={players.length + 1}>Hard</th>
                <th colSpan={players.length * 2} className="aces-divider">
                  Aces
                </th>
              </tr>
              <tr>
                {players.map((player) => (
                  <th key={`easy-${player.id}`} rowSpan={2}>
                    {player.name}
                  </th>
                ))}
                <th rowSpan={2} className="rounds-col">
                  #
                </th>
                {players.map((player) => (
                  <th key={`hard-${player.id}`} rowSpan={2}>
                    {player.name}
                  </th>
                ))}
                <th rowSpan={2} className="rounds-col">
                  #
                </th>
                <th colSpan={players.length} className="aces-divider">
                  Easy
                </th>
                <th colSpan={players.length}>Hard</th>
              </tr>
              <tr>
                <th className="aces-divider">{firstPlayer?.name ?? "Player 1"}</th>
                <th>{secondPlayer?.name ?? "Player 2"}</th>
                <th>{firstPlayer?.name ?? "Player 1"}</th>
                <th>{secondPlayer?.name ?? "Player 2"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const easyValues = players.map(
                  (player) => row.easy.bestVsParByPlayer.get(player.id) ?? null,
                );
                const hardValues = players.map(
                  (player) => row.hard.bestVsParByPlayer.get(player.id) ?? null,
                );

                return (
                  <tr key={row.id}>
                    <th>
                      <Link className="course-link" href={`/courses/${row.id}`}>
                        {row.name}
                      </Link>
                    </th>
                    {players.map((player) => {
                      const value = row.easy.bestVsParByPlayer.get(player.id) ?? null;
                      return (
                        <td
                          key={`easy-value-${row.name}-${player.id}`}
                          className={getScoreClass(value, easyValues)}
                        >
                          {formatVsPar(value)}
                        </td>
                      );
                    })}
                    <td className="rounds-col">{row.easy.roundsPlayed > 0 ? row.easy.roundsPlayed : "-"}</td>
                    {players.map((player) => {
                      const value = row.hard.bestVsParByPlayer.get(player.id) ?? null;
                      return (
                        <td
                          key={`hard-value-${row.name}-${player.id}`}
                          className={getScoreClass(value, hardValues)}
                        >
                          {formatVsPar(value)}
                        </td>
                      );
                    })}
                    <td className="rounds-col">{row.hard.roundsPlayed > 0 ? row.hard.roundsPlayed : "-"}</td>
                    <td className="aces-divider">
                      {row.easy.roundsPlayed > 0
                        ? ((row.easy.acesByPlayer.get(firstPlayer?.id ?? -1) ?? 0) === 0
                            ? "-"
                            : (row.easy.acesByPlayer.get(firstPlayer?.id ?? -1) ?? 0))
                        : ""}
                    </td>
                    <td>
                      {row.easy.roundsPlayed > 0
                        ? ((row.easy.acesByPlayer.get(secondPlayer?.id ?? -1) ?? 0) === 0
                            ? "-"
                            : (row.easy.acesByPlayer.get(secondPlayer?.id ?? -1) ?? 0))
                        : ""}
                    </td>
                    <td>
                      {row.hard.roundsPlayed > 0
                        ? ((row.hard.acesByPlayer.get(firstPlayer?.id ?? -1) ?? 0) === 0
                            ? "-"
                            : (row.hard.acesByPlayer.get(firstPlayer?.id ?? -1) ?? 0))
                        : ""}
                    </td>
                    <td>
                      {row.hard.roundsPlayed > 0
                        ? ((row.hard.acesByPlayer.get(secondPlayer?.id ?? -1) ?? 0) === 0
                            ? "-"
                            : (row.hard.acesByPlayer.get(secondPlayer?.id ?? -1) ?? 0))
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <section className="mini-stats-shell">
          <div className="mini-stats-header">
            <h2 className="mini-stats-title">Net Over/Under Par</h2>
            <Link className="mini-stats-link" href="/stats/net-over-under-par">
              View graphs
            </Link>
          </div>
          <table className="mini-stats-table">
            <thead>
              <tr>
                <th />
                {players.map((player) => (
                  <th key={`net-total-header-${player.id}`}>{player.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["EASY", "HARD"] as const).map((difficulty) => {
                const values = players.map(
                  (player) => personalBestTotalsByDifficulty[difficulty].get(player.id) ?? null,
                );

                return (
                  <tr key={`net-row-${difficulty}`}>
                    <th>{difficulty === "EASY" ? "Easy" : "Hard"}</th>
                    {players.map((player) => {
                      const value = personalBestTotalsByDifficulty[difficulty].get(player.id) ?? null;

                      return (
                        <td
                          key={`net-cell-${difficulty}-${player.id}`}
                          className={getScoreClass(value, values)}
                        >
                          {formatVsPar(value)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="mini-stats-shell">
          <div className="mini-stats-header">
            <h2 className="mini-stats-title">Total Wins</h2>
          </div>
          <table className="mini-stats-table">
            <thead>
              <tr>
                <th />
                {players.map((player) => (
                  <th key={`wins-header-${player.id}`}>{player.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["EASY", "HARD"] as const).map((difficulty) => {
                const values = players.map(
                  (player) => totalWinsByDifficulty[difficulty].get(player.id) ?? 0,
                );

                return (
                  <tr key={`wins-row-${difficulty}`}>
                    <th>{difficulty === "EASY" ? "Easy" : "Hard"}</th>
                    {players.map((player) => {
                      const value = totalWinsByDifficulty[difficulty].get(player.id) ?? 0;

                      return (
                        <td
                          key={`wins-cell-${difficulty}-${player.id}`}
                          className={getScoreClass(-value, values.map((entry) => (entry === 0 ? 0 : -entry)))}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}
