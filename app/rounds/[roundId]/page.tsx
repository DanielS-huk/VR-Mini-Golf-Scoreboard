import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
      courseLayout: true,
    },
  });

  if (!round) {
    notFound();
  }

  redirect(`/courses/${round.courseLayout.courseGroupId}?difficulty=${round.courseLayout.difficulty}`);
}
