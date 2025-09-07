export default function convertToMinutes(millis: number): string {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.round((millis % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
