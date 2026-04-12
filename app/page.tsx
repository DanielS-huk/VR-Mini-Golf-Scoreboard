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
    </main>
  );
}
