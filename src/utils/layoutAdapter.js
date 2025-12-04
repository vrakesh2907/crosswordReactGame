
import { generateLayout } from "./generateCrossword";

export function layoutToCrossword(wordsJson) {
  const words = wordsJson.map((w) => ({
    answer: String(w.answer || "").toUpperCase().replace(/[^A-Z]/g, ""),
    question: w.question || "",
  }));

  const layout = generateLayout(words);
  const placed = layout.result;

  const across = {};
  const down = {};
  let nextNum = 1;

  const acrossWords = placed
    .map((p, idx) => ({ ...p, originalIndex: idx }))
    .filter((p) => p.orientation === "across")
    .sort((a, b) => (a.starty - b.starty) || (a.startx - b.startx));

  acrossWords.forEach((p) => {
    const row = (p.starty || 1) - 1;
    const col = (p.startx || 1) - 1;
    across[nextNum] = {
      clue: p.question || "",
      answer: p.answer,
      row,
      col,
    };
    nextNum++;
  });

  const downWords = placed
    .map((p, idx) => ({ ...p, originalIndex: idx }))
    .filter((p) => p.orientation === "down")
    .sort((a, b) => (a.starty - b.starty) || (a.startx - b.startx));

  downWords.forEach((p) => {
    const row = (p.starty || 1) - 1;
    const col = (p.startx || 1) - 1;
    down[nextNum] = {
      clue: p.question || "",
      answer: p.answer,
      row,
      col,
    };
    nextNum++;
  });

  // Create grid (letters or null)
  const table = layout.table || [];
  const grid = table.map((row) =>
    row.map((ch) => (ch === "-" ? null : ch.toUpperCase()))
  );

  // ❗ IMPORTANT FIX: Expected must NOT contain correct letters
  // Otherwise crossword auto-corrects + overwrites freeze
  const expected = null;

  return { across, down, grid, expected };
}
