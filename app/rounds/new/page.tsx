import { prisma } from "@/lib/prisma";
import { createRound } from "./actions";
import { RoundEntryForm } from "./round-entry-form";

type NewRoundPageProps = {
  searchParams?: Promise<{ layoutId?: string }>;
};

export default async function NewRoundPage({ searchParams }: NewRoundPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [layouts, players] = await Promise.all([
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
  const requestedLayoutId = Number(resolvedSearchParams?.layoutId);
  const initialLayoutId =
    Number.isInteger(requestedLayoutId) && layouts.some((layout) => layout.id === requestedLayoutId)
      ? String(requestedLayoutId)
      : undefined;

  return (
    <main className="page-shell">
      <RoundEntryForm
        layouts={layouts}
        players={players}
        action={createRound}
        initialSelectedLayoutId={initialLayoutId}
        heading="Add New Round"
        description=""
        submitLabel="Save round"
      />
    </main>
  );
}
