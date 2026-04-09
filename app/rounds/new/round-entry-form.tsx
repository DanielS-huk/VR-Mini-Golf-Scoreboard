"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { getLayoutDisplayName } from "@/lib/course-display";
import type { RoundActionState } from "./actions";

type Player = {
  id: number;
  name: string;
};

type Hole = {
  id: number;
  number: number;
  par: number;
};

type Layout = {
  id: number;
  displayName: string;
  difficulty: "EASY" | "HARD";
  courseGroup: {
    name: string;
  };
  holes: Hole[];
};

type ScoresByPlayer = Record<number, Record<number, string>>;

type RoundEntryFormProps = {
  layouts: Layout[];
  players: Player[];
  action: (state: RoundActionState, formData: FormData) => Promise<RoundActionState>;
  initialSelectedLayoutId?: string;
  initialPlayedAt?: string;
  initialNotes?: string;
  initialScoresByLayout?: Record<string, ScoresByPlayer>;
  heading?: string;
  description?: string;
  submitLabel?: string;
};

const initialState: RoundActionState = {
  error: null,
};

function buildInitialScores(layout: Layout, players: Player[]) {
  const scores: ScoresByPlayer = {};

  for (const player of players) {
    scores[player.id] = {};

    for (const hole of layout.holes) {
      scores[player.id][hole.id] = "";
    }
  }

  return scores;
}

function formatVsPar(total: number) {
  if (total === 0) {
    return "E";
  }

  return total > 0 ? `+${total}` : `${total}`;
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function getCellKey(layoutId: string, playerId: number, holeId: number) {
  return `${layoutId}:${playerId}:${holeId}`;
}

export function RoundEntryForm({
  layouts,
  players,
  action,
  initialSelectedLayoutId,
  initialPlayedAt,
  initialNotes,
  initialScoresByLayout,
  heading = "Add New Round",
  description = "",
  submitLabel = "Save round",
}: RoundEntryFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [selectedLayoutId, setSelectedLayoutId] = useState(
    initialSelectedLayoutId ?? String(layouts[0]?.id ?? ""),
  );
  const [scoresByLayout, setScoresByLayout] = useState<Record<string, ScoresByPlayer>>(
    initialScoresByLayout ?? {},
  );
  const [playedAt, setPlayedAt] = useState(initialPlayedAt ?? todayValue);
  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const selectedLayout =
    layouts.find((layout) => String(layout.id) === selectedLayoutId) ?? layouts[0] ?? null;

  useEffect(() => {
    if (initialSelectedLayoutId && initialSelectedLayoutId !== selectedLayoutId) {
      setSelectedLayoutId(initialSelectedLayoutId);
    }
  }, [initialSelectedLayoutId, selectedLayoutId]);

  useEffect(() => {
    if (!selectedLayout) {
      return;
    }

    setScoresByLayout((current) => {
      if (current[selectedLayoutId]) {
        return current;
      }

      return {
        ...current,
        [selectedLayoutId]: buildInitialScores(selectedLayout, players),
      };
    });
  }, [players, selectedLayout, selectedLayoutId]);

  if (!selectedLayout) {
    return <p className="empty-state">Seed at least one course before entering rounds.</p>;
  }

  const activeScores =
    scoresByLayout[selectedLayoutId] ?? buildInitialScores(selectedLayout, players);
  const totalPar = selectedLayout.holes.reduce((sum, hole) => sum + hole.par, 0);

  const serializedScores = JSON.stringify(
    players.map((player) => ({
      playerId: player.id,
      holes: selectedLayout.holes.map((hole) => ({
        holeId: hole.id,
        strokes: Number(activeScores[player.id]?.[hole.id] ?? 0),
      })),
    })),
  );

  function updateScore(playerId: number, holeId: number, nextValue: string) {
    const sanitizedValue = nextValue.replace(/\D/g, "").slice(0, 2);

    setScoresByLayout((current) => ({
      ...current,
      [selectedLayoutId]: {
        ...(current[selectedLayoutId] ?? buildInitialScores(selectedLayout, players)),
        [playerId]: {
          ...((current[selectedLayoutId] ?? buildInitialScores(selectedLayout, players))[playerId] ??
            {}),
          [holeId]: sanitizedValue,
        },
      },
    }));
  }

  function focusCell(playerIndex: number, holeIndex: number) {
    const targetPlayer = players[playerIndex];
    const targetHole = selectedLayout.holes[holeIndex];

    if (!targetPlayer || !targetHole) {
      return;
    }

    const key = getCellKey(selectedLayoutId, targetPlayer.id, targetHole.id);
    const target = cellRefs.current[key];
    target?.focus();
    target?.select();
  }

  return (
    <form action={formAction} className="round-form">
      <div className="form-header">
        <div>
          <p className="eyebrow">Round Entry</p>
          <h1>{heading}</h1>
          {description ? <p className="hero-copy">{description}</p> : null}
        </div>
        <a className="text-link" href="/">
          Back home
        </a>
      </div>

      <section className="round-form-grid">
        <label className="field">
          <span>Course</span>
          <select
            name="courseLayoutId"
            value={selectedLayoutId}
            onChange={(event) => setSelectedLayoutId(event.target.value)}
          >
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {getLayoutDisplayName(layout.displayName)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Date played</span>
          <input
            required
            type="date"
            name="playedAt"
            value={playedAt}
            onChange={(event) => setPlayedAt(event.target.value)}
          />
        </label>

        <label className="field field-wide">
          <span>Notes</span>
          <textarea
            name="notes"
            rows={3}
            placeholder="Optional notes about the round."
            defaultValue={initialNotes ?? ""}
          />
        </label>
      </section>

      <input type="hidden" name="scores" value={serializedScores} />

      {state.error ? <p className="form-error">{state.error}</p> : null}

      <section className="scorecard-shell">
        <div className="scorecard-table-wrap">
          <table className="scorecard-table scorecard-entry-table">
            <tbody>
              <tr>
                <th>Hole</th>
                {selectedLayout.holes.map((hole) => (
                  <td key={`hole-${hole.id}`}>{hole.number}</td>
                ))}
                <td className="scorecard-total-cell">Total</td>
                <td className="scorecard-total-cell">Vs</td>
                <td className="scorecard-total-cell">Aces</td>
              </tr>
              <tr className="par-row">
                <th>Par</th>
                {selectedLayout.holes.map((hole) => (
                  <td key={`par-${hole.id}`}>{hole.par}</td>
                ))}
                <td className="scorecard-total-cell">{totalPar}</td>
                <td className="scorecard-total-cell">E</td>
                <td className="scorecard-total-cell">-</td>
              </tr>
              {players.map((player, playerIndex) => {
                const total = selectedLayout.holes.reduce(
                  (sum, hole) => sum + Number(activeScores[player.id]?.[hole.id] ?? 0),
                  0,
                );
                const aces = selectedLayout.holes.reduce((sum, hole) => {
                  return sum + (Number(activeScores[player.id]?.[hole.id] ?? 0) === 1 ? 1 : 0);
                }, 0);

                return (
                  <tr key={player.id}>
                    <th>{player.name}</th>
                    {selectedLayout.holes.map((hole, holeIndex) => {
                      const key = getCellKey(selectedLayoutId, player.id, hole.id);

                      return (
                        <td key={key}>
                          <input
                            ref={(element) => {
                              cellRefs.current[key] = element;
                            }}
                            required
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="off"
                            value={activeScores[player.id]?.[hole.id] ?? ""}
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) => updateScore(player.id, hole.id, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "ArrowRight") {
                                event.preventDefault();
                                focusCell(playerIndex, holeIndex + 1);
                              }

                              if (event.key === "ArrowLeft") {
                                event.preventDefault();
                                focusCell(playerIndex, holeIndex - 1);
                              }

                              if (event.key === "ArrowDown") {
                                event.preventDefault();
                                focusCell(playerIndex + 1, holeIndex);
                              }

                              if (event.key === "ArrowUp") {
                                event.preventDefault();
                                focusCell(playerIndex - 1, holeIndex);
                              }

                              if (event.key === "Enter") {
                                event.preventDefault();
                                focusCell(playerIndex, holeIndex + 1);
                              }
                            }}
                          />
                        </td>
                      );
                    })}
                    <td className="scorecard-total-cell">{total}</td>
                    <td className="scorecard-total-cell">{formatVsPar(total - totalPar)}</td>
                    <td className="scorecard-total-cell">{aces}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="form-actions">
        <button className="primary-button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
