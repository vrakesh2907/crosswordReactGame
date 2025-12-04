/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";

export default function CustomCrossword({
  gridData,
  across,
  down,
onScore = () => {},
  onWordCompleted = () => {},
}) {
  const [grid, setGrid] = useState([]);
  const [status, setStatus] = useState({});
  const [activeClue, setActiveClue] = useState(null);

  const inputsRef = useRef({});
  const clueCellsRef = useRef({});
  const clueNumbersRef = useRef({});
  const frozenWordsRef = useRef({});
  const completedAnswersRef = useRef({});


  useEffect(() => {
    const cloned = gridData.map((row) =>
      row.map((cell) => ({
        letter: cell || "",
        user: "",
        block: cell === null,
      }))
    );

    setGrid(cloned);
    inputsRef.current = {};
    clueCellsRef.current = {};
    clueNumbersRef.current = {};
    frozenWordsRef.current = {};
    completedAnswersRef.current = {};
    setStatus({});
    setActiveClue(null);
  }, [gridData]);

  /** BUILD CLUE CELLS **/
  useEffect(() => {
    if (!grid || grid.length === 0) return;

    const newClueCells = {};
    const newNumbers = {};

    // ACROSS
    Object.entries(across).forEach(([num, d]) => {
      const cells = [];
      let r = d.row;
      let c = d.col;

      for (let i = 0; i < d.answer.length; i++) {
        if (!grid[r] || !grid[r][c] || grid[r][c].block) break;
        cells.push({ r, c });
        c++;
      }

      newClueCells[`A${num}`] = cells;
      if (cells.length > 0) {
        newNumbers[`${cells[0].r}-${cells[0].c}`] = num;
      }
    });

    // DOWN
    Object.entries(down).forEach(([num, d]) => {
      const cells = [];
      let r = d.row;
      let c = d.col;

      for (let i = 0; i < d.answer.length; i++) {
        if (!grid[r] || !grid[r][c] || grid[r][c].block) break;
        cells.push({ r, c });
        r++;
      }

      newClueCells[`D${num}`] = cells;

      if (cells.length > 0 && !newNumbers[`${cells[0].r}-${cells[0].c}`]) {
        newNumbers[`${cells[0].r}-${cells[0].c}`] = num;
      }
    });

    clueCellsRef.current = newClueCells;
    clueNumbersRef.current = newNumbers;
  }, [grid]);

  /** Find clues for a cell **/
  const findCluesForCell = (r, c) => {
    const result = [];

    for (const key of Object.keys(clueCellsRef.current)) {
      const arr = clueCellsRef.current[key];
      if (arr.some((p) => p.r === r && p.c === c)) {
        const dir = key.startsWith("A") ? "across" : "down";
        const num = key.slice(1);
        result.push({ key, num, direction: dir });
      }
    }
    return result;
  };

  /** Detect new clue selection **/
  const handleFocus = (r, c) => {
    const belongs = findCluesForCell(r, c);
    if (!belongs.length) return;

    if (activeClue) {
      const activeKey =
        activeClue.direction === "across"
          ? `A${activeClue.num}`
          : `D${activeClue.num}`;

      if (clueCellsRef.current[activeKey]?.some((p) => p.r === r && p.c === c)) {
        return;
      }
    }

    const acrossCandidate = belongs.find((x) => x.direction === "across");
    const chosen = acrossCandidate || belongs[0];

    setActiveClue({ num: chosen.num, direction: chosen.direction });
  };

  /** Helpers **/
  const focusCell = (r, c) => {
    const el = inputsRef.current[`${r}-${c}`];
    if (el) setTimeout(() => el.focus(), 0);
  };

  const moveNext = (r, c) => {
    if (!activeClue) return;

    const key =
      activeClue.direction === "across"
        ? `A${activeClue.num}`
        : `D${activeClue.num}`;

    const cells = clueCellsRef.current[key];
    if (!cells) return;

    const idx = cells.findIndex((p) => p.r === r && p.c === c);

    for (let i = idx + 1; i < cells.length; i++) {
      const next = cells[i];
      const isFrozen = findCluesForCell(next.r, next.c).some(
        (info) =>
          frozenWordsRef.current[
            `${info.direction === "across" ? "A" : "D"}${info.num}`
          ]
      );
      if (!isFrozen) {
        focusCell(next.r, next.c);
        return;
      }
    }
  };

  const movePrev = (r, c) => {
    if (!activeClue) return;

    const key =
      activeClue.direction === "across"
        ? `A${activeClue.num}`
        : `D${activeClue.num}`;

    const cells = clueCellsRef.current[key];
    if (!cells) return;

    const idx = cells.findIndex((p) => p.r === r && p.c === c);

    for (let i = idx - 1; i >= 0; i--) {
      const prev = cells[i];

      const isFrozen = findCluesForCell(prev.r, prev.c).some(
        (info) =>
          frozenWordsRef.current[
            `${info.direction === "across" ? "A" : "D"}${info.num}`
          ]
      );

      if (!isFrozen) {
        focusCell(prev.r, prev.c);
        return;
      }
    }
  };

  /** Input change **/
  const handleChange = (r, c, value) => {
    const val = value.toUpperCase().slice(-1);
    const correct = grid[r][c].letter;

    setGrid((prev) => {
      const copy = prev.map((row) => row.map((cell) => ({ ...cell })));
      copy[r][c].user = val;
      return copy;
    });

    setStatus((prev) => ({
      ...prev,
      [`${r}-${c}`]:
        val === ""
          ? "blank"
          : val === correct
          ? "correct"
          : "wrong",
    }));

    if (activeClue && val !== "") {
      moveNext(r, c);
    }
  };

  /** Key Down **/
  const handleKeyDown = (e, r, c) => {
    const clues = findCluesForCell(r, c);
    const frozen = clues.some(
      (info) =>
        frozenWordsRef.current[
          `${info.direction === "across" ? "A" : "D"}${info.num}`
        ]
    );

    if (frozen) {
      e.preventDefault();
      return;
    }

    if (e.key === "Backspace") {
      setTimeout(() => {
        if (!inputsRef.current[`${r}-${c}`]?.value) movePrev(r, c);
      }, 0);
    }

    if (activeClue) {
      if (activeClue.direction === "across") {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          moveNext(r, c);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          movePrev(r, c);
        }
      } else {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          moveNext(r, c);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          movePrev(r, c);
        }
      }
    }
  };

  /** SCORE **/
  useEffect(() => {
    const correctCount = Object.values(status).filter(
      (x) => x === "correct"
    ).length;
    if (typeof onScore === "function") {
  onScore(correctCount);
}
  }, [status]);

  /** DETECT WORD COMPLETION **/
  useEffect(() => {
    if (!activeClue) return;

    const key =
      activeClue.direction === "across"
        ? `A${activeClue.num}`
        : `D${activeClue.num}`;

    const cells = clueCellsRef.current[key];
    if (!cells) return;

    const done = cells.every(
      (pos) => status[`${pos.r}-${pos.c}`] === "correct"
    );

    if (done && !frozenWordsRef.current[key]) {
      frozenWordsRef.current[key] = true;

      const answer =
        activeClue.direction === "across"
          ? across[activeClue.num].answer
          : down[activeClue.num].answer;

      completedAnswersRef.current[activeClue.num] = answer;

      onWordCompleted?.(activeClue.num, answer);
    }
  }, [status]);

  const clueNumbers = clueNumbersRef.current;

  return (

<div className="flex flex-col items-center">
<div
  className="
    grid
    [--box:34px]     /* Default desktop size */
    [@media(max-width:500px)]:[--box:24px]   /* Mobile < 500px */
  "
  style={{
    gridTemplateColumns: `repeat(${grid[0]?.length || 0}, var(--box))`,
    gap: "2px",
  }}
>

    {grid.map((row, r) =>
      row.map((cell, c) => {
        if (cell.block)
          return (
            <div
              key={`${r}-${c}`}
              className="w-[34px] h-[34px]
                         sm:w-[34px] sm:h-[34px]
                         xs:w-[28px] xs:h-[28px]"
            />
          );

        const st = status[`${r}-${c}`];
        const key = `${r}-${c}`;

        const belongsToFrozen = findCluesForCell(r, c).some(
          (info) =>
            frozenWordsRef.current[
              `${info.direction === "across" ? "A" : "D"}${info.num}`
            ]
        );

        const bg =
          belongsToFrozen || st === "correct"
            ? "#4CAF50"
            : st === "wrong"
            ? "#F44336"
            : "transparent";

        return (
          <div
            key={`${r}-${c}`}
            className="relative border border border-black
                       w-[auto] h-[34px]
                       sm:w-[34px] sm:h-[34px]
                       xs:w-[28px] xs:h-[28px]"
            style={{ background: bg }}
          >
            {clueNumbers[`${r}-${c}`] && (
              <div
                className="absolute text-[9px] font-bold"
                style={{ top: 2, left: 4 }}
              >
                {clueNumbers[`${r}-${c}`]}
              </div>
            )}

            <input
              disabled={belongsToFrozen}
              ref={(el) => (inputsRef.current[key] = el)}
              maxLength={1}
              value={cell.user}
              onFocus={() => handleFocus(r, c)}
              onClick={() => handleFocus(r, c)}
              onChange={(e) => handleChange(r, c, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, r, c)}
              className="absolute inset-0 w-full h-full text-center font-bold outline-none bg-transparent
                         text-lg xs:text-base"
              style={{ textTransform: "uppercase" }}
            />
          </div>
        );
      })
    )}
  </div>
</div>


  );
}
