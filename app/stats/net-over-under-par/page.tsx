import Link from "next/link";
import { LogoutButton } from "@/app/auth/logout-button";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GraphPoint = {
  roundNumber: number;
  value: number;
};

type GraphSeries = {
  playerId: number;
  playerName: string;
  color: string;
  points: GraphPoint[];
};

type DifficultyGraphData = {
  difficulty: "EASY" | "HARD";
  series: GraphSeries[];
};

const playerColors = ["#d97706", "#2563eb", "#0f766e", "#b91c1c"];

function formatVsPar(value: number) {
  if (value === 0) {
    return "E";
  }

  return value > 0 ? `+${value}` : `${value}`;
}

function niceStep(range: number, targetTickCount: number) {
  const roughStep = range / Math.max(targetTickCount - 1, 1);
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(roughStep, 1)));
  const residual = roughStep / magnitude;

  if (residual <= 1) {
    return magnitude;
  }

  if (residual <= 2) {
    return 2 * magnitude;
  }

  if (residual <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

function buildYAxisTicks(minValue: number, maxValue: number) {
  const range = Math.max(maxValue - minValue, 1);
  const step = niceStep(range, 5);
  const tickMin = Math.floor(minValue / step) * step;
  const tickMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];

  for (let tick = tickMin; tick <= tickMax; tick += step) {
    ticks.push(tick);
  }

  if (!ticks.includes(0)) {
    ticks.push(0);
    ticks.sort((left, right) => left - right);
  }

  return ticks;
}

function buildXAxisTicks(maxRound: number) {
  if (maxRound <= 1) {
    return [1];
  }

  const tickCount = Math.min(maxRound, 6);
  const ticks = new Set<number>();

  for (let index = 0; index < tickCount; index += 1) {
    const value = 1 + Math.round((index / (tickCount - 1)) * (maxRound - 1));
    ticks.add(value);
  }

  ticks.add(1);
  ticks.add(maxRound);

  return Array.from(ticks).sort((left, right) => left - right);
}

function getChartMetrics(series: GraphSeries[], width: number, height: number) {
  const paddingLeft = 58;
  const paddingRight = 18;
  const paddingTop = 18;
  const paddingBottom = 42;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const allPoints = series.flatMap((entry) => entry.points);
  const maxRound = Math.max(...allPoints.map((point) => point.roundNumber), 1);
  const minValue = Math.min(...allPoints.map((point) => point.value), 0);
  const maxValue = Math.max(...allPoints.map((point) => point.value), 0);
  const yTicks = buildYAxisTicks(minValue, maxValue);
  const yMin = Math.min(...yTicks);
  const yMax = Math.max(...yTicks);
  const xTicks = buildXAxisTicks(maxRound);

  const getX = (roundNumber: number) =>
    paddingLeft + ((roundNumber - 1) / Math.max(maxRound - 1, 1)) * plotWidth;

  const getY = (value: number) => paddingTop + ((value - yMin) / Math.max(yMax - yMin, 1)) * plotHeight;

  return {
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    plotWidth,
    plotHeight,
    maxRound,
    xTicks,
    yTicks,
    getX,
    getY,
  };
}

function buildGraphPath(points: GraphPoint[], getX: (roundNumber: number) => number, getY: (value: number) => number) {
  return points.map((point) => `${getX(point.roundNumber)},${getY(point.value)}`).join(" ");
}

function TrendGraph({ difficulty, series }: DifficultyGraphData) {
  const width = 960;
  const height = 360;
  const hasAnyPoints = series.some((entry) => entry.points.length > 0);
  const metrics = getChartMetrics(series, width, height);

  return (
    <section className="trend-card">
      <div className="trend-card-header">
        <h2>{difficulty === "EASY" ? "Easy" : "Hard"}</h2>
        <div className="trend-legend">
          {series.map((entry) => (
            <span key={`${difficulty}-${entry.playerId}`} className="trend-legend-item">
              <span className="trend-legend-swatch" style={{ borderColor: entry.color }} />
              {entry.playerName}
            </span>
          ))}
        </div>
      </div>

      {hasAnyPoints ? (
        <div className="trend-chart-layout">
          <p className="trend-axis-label trend-axis-y">Net over/under par</p>
          <div className="trend-chart-frame">
            <svg
              className="trend-chart"
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`${difficulty.toLowerCase()} net over under par trend`}
            >
              {metrics.yTicks.map((tick) => {
                const y = metrics.getY(tick);

                return (
                  <g key={`${difficulty}-y-tick-${tick}`}>
                    <line
                      x1={metrics.paddingLeft}
                      y1={y}
                      x2={width - metrics.paddingRight}
                      y2={y}
                      className={tick === 0 ? "trend-zero-line" : "trend-grid-line"}
                    />
                    <text
                      x={metrics.paddingLeft - 10}
                      y={y + 5}
                      textAnchor="end"
                      className="trend-tick-label"
                    >
                      {formatVsPar(tick)}
                    </text>
                  </g>
                );
              })}

              {metrics.xTicks.map((tick) => {
                const x = metrics.getX(tick);

                return (
                  <g key={`${difficulty}-x-tick-${tick}`}>
                    <line
                      x1={x}
                      y1={metrics.paddingTop}
                      x2={x}
                      y2={height - metrics.paddingBottom}
                      className="trend-grid-line"
                    />
                    <text
                      x={x}
                      y={height - metrics.paddingBottom + 22}
                      textAnchor="middle"
                      className="trend-tick-label"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              <line
                x1={metrics.paddingLeft}
                y1={metrics.paddingTop}
                x2={metrics.paddingLeft}
                y2={height - metrics.paddingBottom}
                className="trend-axis-line"
              />
              <line
                x1={metrics.paddingLeft}
                y1={height - metrics.paddingBottom}
                x2={width - metrics.paddingRight}
                y2={height - metrics.paddingBottom}
                className="trend-axis-line"
              />

              {series.map((entry) => {
                const path = buildGraphPath(entry.points, metrics.getX, metrics.getY);

                if (!path) {
                  return null;
                }

                return (
                  <g key={`${difficulty}-${entry.playerId}-series`}>
                    <polyline
                      points={path}
                      fill="none"
                      stroke={entry.color}
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {entry.points.map((point) => (
                      <circle
                        key={`${difficulty}-${entry.playerId}-point-${point.roundNumber}`}
                        cx={metrics.getX(point.roundNumber)}
                        cy={metrics.getY(point.value)}
                        r="4"
                        fill={entry.color}
                        stroke="rgba(255, 255, 255, 0.96)"
                        strokeWidth="2"
                      >
                        <title>{`${entry.playerName}: Round ${point.roundNumber}, ${formatVsPar(point.value)}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
            </svg>
            <p className="trend-axis-label trend-axis-x">Rounds played on this difficulty</p>
          </div>
        </div>
      ) : (
        <p className="empty-state">No {difficulty.toLowerCase()} rounds have been recorded yet.</p>
      )}
    </section>
  );
}

export default async function NetOverUnderParPage() {
  const [players, rounds, isAdmin] = await Promise.all([
    prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.round.findMany({
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
            holeScores: true,
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
      },
      orderBy: [{ playedAt: "asc" }, { id: "asc" }],
    }),
    isAdminAuthenticated(),
  ]);

  const graphs = (["EASY", "HARD"] as const).map((difficulty) => {
    const runningTotals = new Map(players.map((player) => [player.id, 0]));
    let roundNumber = 0;

    const series = players.map((player, index) => ({
      playerId: player.id,
      playerName: player.name,
      color: playerColors[index % playerColors.length],
      points: [] as GraphPoint[],
    }));

    const roundsForDifficulty = rounds.filter((round) => round.courseLayout.difficulty === difficulty);

    for (const round of roundsForDifficulty) {
      roundNumber += 1;
      const totalPar = round.courseLayout.holes.reduce((sum, hole) => sum + hole.par, 0);

      for (const entry of series) {
        const roundPlayer = round.players.find((player) => player.playerId === entry.playerId);
        const previousTotal = runningTotals.get(entry.playerId) ?? 0;
        const nextTotal = roundPlayer
          ? previousTotal +
            roundPlayer.holeScores.reduce((sum, score) => sum + score.strokes, 0) -
            totalPar
          : previousTotal;

        runningTotals.set(entry.playerId, nextTotal);
        entry.points.push({
          roundNumber,
          value: nextTotal,
        });
      }
    }

    return {
      difficulty,
      series,
    };
  });

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Match Trends</p>
        <h1>Net Over/Under Par</h1>
        <p className="hero-copy">
          Cumulative scoring relative to par, shown separately for easy and hard rounds.
        </p>
        <div className="detail-links">
          <Link className="text-link" href="/">
            Return home
          </Link>
          {isAdmin ? <LogoutButton /> : <Link className="text-link" href="/login">Admin login</Link>}
        </div>
      </section>

      <section className="trend-grid">
        {graphs.map((graph) => (
          <TrendGraph
            key={graph.difficulty}
            difficulty={graph.difficulty}
            series={graph.series}
          />
        ))}
      </section>
    </main>
  );
}
