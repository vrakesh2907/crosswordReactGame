/* eslint-disable */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { layoutToCrossword } from "../utils/layoutAdapter";
import CustomCrossword from "../utils/newJsCrossword";
import { generateSubmitPayload } from "../hooks/useAutoPayload";
import useSubmitCrossword from "../hooks/useSubmitCrossword";

function parseTimerString(str) {
  if (!str) return 0;
  const parts = str.split(":");
  if (parts.length === 2) {
    return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  }
  const minutes = parseInt(str, 10);
  return isNaN(minutes) ? 0 : minutes * 60;
}

export default function SmartCrosswordPage() {
  const { theme, session, loading, error } = useContext(ThemeContext);

  const [score, setScore] = useState(0);
  const [timerSec, setTimerSec] = useState(0);

  // ⭐ NEW: freeze timer when submit or puzzle completes
  const [timerRunning, setTimerRunning] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [completedAnswers, setCompletedAnswers] = useState({});
  const [completedWords, setCompletedWords] = useState({});
  const [progress, setProgress] = useState(0);
  const [preFilledWords, setPreFilledWords] = useState({});
  const { submitScore } = useSubmitCrossword();

  // -------------------------
  // Load RAW puzzle words
  // -------------------------
  const rawWordsArray = useMemo(() => {
    if (!theme) return null;

    if (Array.isArray(theme.questions_and_answers))
      return theme.questions_and_answers;

    if (Array.isArray(theme.words)) return theme.words;

    if (Array.isArray(theme.questions)) return theme.questions;

    for (const key of Object.keys(theme)) {
      if (
        Array.isArray(theme[key]) &&
        theme[key]?.length > 0 &&
        (theme[key][0].question || theme[key][0].answer)
      ) {
        return theme[key];
      }
    }

    return null;
  }, [theme]);

  // -------------------------
  // Build crossword puzzle
  // -------------------------
  const puzzle = useMemo(() => {
    if (!rawWordsArray) return null;
    try {
      return layoutToCrossword(rawWordsArray);
    } catch (e) {
      console.error("layoutToCrossword error", e);
      return null;
    }
  }, [rawWordsArray]);

  // -------------------------
  // Score calculation
  // -------------------------
  useEffect(() => {
    if (!theme) return;
    const wordCount = Object.keys(completedWords).length;
    const pointsPerWord = Number(theme.points);
    setScore(wordCount * pointsPerWord);
  }, [completedWords, theme]);

  // -------------------------
  // Timer initialization
  // -------------------------
  useEffect(() => {
    if (!theme) return;

    if (theme.use_timeout === true || theme.use_timeout === "true") {
      setTimerSec(parseTimerString(theme.timer));
    } else {
      setTimerSec(0);
    }
  }, [theme]);

  // -------------------------
  // Timer running (FREEZE FIX)
  // -------------------------
  useEffect(() => {
    if (!theme) return;
    if (!timerRunning) return; // ⭐ STOP TIMER HERE

    let tid;

    if (theme.use_timeout === true || theme.use_timeout === "true") {
      // countdown
      tid = setInterval(() => {
        setTimerSec((s) => {
          if (s <= 1) {
            clearInterval(tid);
            setTimerRunning(false);
            setShowPopup(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      // count-up
      tid = setInterval(() => {
        setTimerSec((s) => s + 1);
      }, 1000);
    }

    return () => clearInterval(tid);
  }, [theme, timerRunning]);

  // -------------------------
  // Progress bar calculation
  // -------------------------
  useEffect(() => {
    if (!puzzle) return;

    const total =
      Object.keys(puzzle.across || {}).length +
      Object.keys(puzzle.down || {}).length;

    const solved = Object.keys(completedWords).length;

    if (total > 0) {
      setProgress((solved / total) * 100);
    }
  }, [completedWords, puzzle]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // -------------------------
  // DO NOT AUTOFILL CROSSWORD, ONLY SHOW HINT ABOVE CLUE
  // -------------------------

  useEffect(() => {
    if (!puzzle) return;

    const answers = {};

   
    const dashPattern = /[-_]+/;

  
    for (const [num, data] of Object.entries(puzzle.across)) {
      if (dashPattern.test(data.clue)) {
        answers[num] = data.answer;
      }
    }

  
    for (const [num, data] of Object.entries(puzzle.down)) {
      if (dashPattern.test(data.clue)) {
        answers[num] = data.answer;
      }
    }

    setPreFilledWords(answers);
  }, [puzzle]);

  const totalPossibleScore = puzzle
    ? (Object.keys(puzzle.across).length + Object.keys(puzzle.down).length) *
      Number(theme.points)
    : 0;


  const submitGameResult = async () => {
    setTimerRunning(false); // ⭐ FREEZE TIME

    const formattedTime = formatTime(timerSec);

    const payload = generateSubmitPayload(score, formattedTime);

    console.log("FINAL SUBMISSION PAYLOAD:", payload);

    const result = await submitScore(payload);

    console.log("API RESULT:", result);

    setShowPopup(true);

    if (result?.success) {
      window.location.href = "/thankyou";
    }
  };

 

  return (
    <main
      role="main"
      className="min-h-screen w-screen overflow-y-auto flex items-start md:items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${
          window.innerWidth < 768
            ? theme?.background_mob
            : theme?.background_desk
        })`,
      }}
    >
      <div
        className="w-[90%] max-w-[1400px] flex flex-col"
       // style={{ marginTop: "-60px" }}
      >
        {loading && <div className="p-8">Loading theme...</div>}
        {error && <div className="p-8 text-red-500">Failed to load theme</div>}
        {!rawWordsArray && !loading && (
          <div className="p-8">Puzzle data missing in theme</div>
        )}

        {puzzle && puzzle.grid && (
          <>
          
            <header className="w-full py-3 px-4">
              <div className="text-center mt-3">
                <h1
                  className="text-xl sm:text-2xl md:text-3xl font-extrabold"
                  style={{ color: theme?.landing_page_title_color || "#000" }}
                >
                  {theme?.landing_page_title || "Solve the puzzle"}
                </h1>
                <p className="text-gray-700 mt-1 text-sm">
                  {theme?.themeDescription || ""}
                </p>
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <div
                  className="
                justify-self-start
                w-[150px] text-center rounded-[10px] px-[10px] py-[5px]
                text-[15px] font-medium bg-[#f06c60] text-white
              "
                >
                  Time: {formatTime(timerSec)}
                </div>
                <div
                  className="
                justify-self-end
                w-[150px] text-center rounded-[10px] px-[10px] py-[5px]
                text-[15px] font-medium bg-[#f06c60] text-white
              "
                >
                  Points: {score}
                </div>
              </div>

             
              <div className="mt-4 w-full">
                <div className="bg-gray-300 h-3 rounded-full">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-center text-sm mt-1">
                  {Math.floor(progress)}% Completed
                </div>
              </div>
            </header>

          
            <div className="flex flex-col md:flex-row gap-6 mt-8">
            
              <div className="flex-1 flex justify-center">
                <CustomCrossword
                  gridData={puzzle.grid}
                  across={puzzle.across}
                  down={puzzle.down}
                  preFilledWords={preFilledWords}
                  onScore={() => {}}
                  onWordCompleted={(num, answer) => {
                    const updated = { ...completedWords, [num]: true };

                    setCompletedWords(updated);
                    setCompletedAnswers((prev) => ({ ...prev, [num]: answer }));

                   
                    const total =
                      Object.keys(puzzle.across).length +
                      Object.keys(puzzle.down).length;

                    if (Object.keys(updated).length === total) {
                      submitGameResult();
                    }
                  }}
                  onProgressUpdate={(completedCount, totalCount) => {
                    // Update progress bar based on completed words
                    const percentage = (completedCount / totalCount) * 100;
                    setProgress(percentage);
                  }}
                />
              </div>

             
              <div className="flex-1 text-left max-w-[500px] mx-auto">
                <h3 className="text-2xl font-semibold">Across</h3>
                <ul className="mt-2 space-y-3">
                  {Object.entries(puzzle.across).map(([num, d]) => {
                    const isBlank = /[-_]+/.test(d.clue);

                    return (
                      <li key={num} className="leading-snug flex flex-col">
                        <div className="flex">
                          <strong className="mr-1">{num}.</strong>
                          <span>{d.clue}</span>

                          {!isBlank && completedAnswers[num] && (
                            <span className="text-green-700 ml-1">
                              {completedAnswers[num]}
                            </span>
                          )}

                          {isBlank && (
                            <div className="text-blue-600 font-semibold ml-1">
                              {d.answer}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <h3 className="text-2xl font-semibold mt-8">Down</h3>
                <ul className="mt-2 space-y-3">
                  {Object.entries(puzzle.down).map(([num, d]) => {
                    const isBlank = /[-_]+/.test(d.clue);

                    return (
                      <li key={num} className="leading-snug flex flex-col">
                        <div className="flex">
                          <strong className="mr-1">{num}.</strong>
                          <span>{d.clue}</span>

                          {!isBlank && completedAnswers[num] && (
                            <span className="text-green-700 ml-1">
                              {completedAnswers[num]}
                            </span>
                          )}

                          {isBlank && (
                            <div className="text-blue-600 font-semibold ml-1">
                              {d.answer}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex gap-3">
                  {/* ⭐ UI KE ANDAR SUBMIT TOUCH NAHI KARNA */}
                  <button
                    onClick={() => {
                      submitGameResult();
                      setShowPopup(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Submit
                  </button>

                  {/* <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Restart
                  </button> */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {theme?.end_game_img_popup && (
                <img
                  src={theme.end_game_img_popup}
                  className="w-full md:w-1/2 object-contain rounded"
                />
              )}

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">
                  {theme?.end_game_text_popup}
                </h2>

                <p className="mt-2">
                  <strong>Score:</strong> {score} / {totalPossibleScore}
                </p>

                <p className="mt-1">
                  <strong>Time:</strong> {formatTime(timerSec)}
                </p>

                <div className="mt-6 flex gap-3 justify-center md:justify-start">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#f06c60] text-white rounded"
                  >
                    Play Again
                  </button>

                  <button
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
