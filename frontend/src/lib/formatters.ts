export function formatTime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) {
    return "--";
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatDifficulty(
  difficulty: string | null | undefined,
): string {
  if (!difficulty) return "Unspecified";
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
}
