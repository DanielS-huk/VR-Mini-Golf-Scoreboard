const courseNameOverrides = new Map<string, string>([
  ["20,000 Leagues Under the Sea", "20,000 Leagues"],
  ["Around the World in 80 Days", "Around the World"],
  ["Journey to the Center of the Earth", "Center of the Earth"],
  ["Alices Adventures in Wonderland", "Alice in Wonderland"],
]);

export function getCourseDisplayName(name: string) {
  return courseNameOverrides.get(name) ?? name;
}

export function getLayoutDisplayName(displayName: string) {
  const match = displayName.match(/^(.*)\s+(EASY|HARD)$/);

  if (!match) {
    return getCourseDisplayName(displayName);
  }

  const [, courseName, difficulty] = match;
  return `${getCourseDisplayName(courseName)} ${difficulty}`;
}
