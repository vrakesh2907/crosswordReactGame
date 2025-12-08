/* eslint-disable */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { layoutToCrossword } from "../utils/layoutAdapter";
import CustomCrossword from "../utils/newJsCrossword";
import { generateSubmitPayload } from "../hooks/useAutoPayload";
import useSubmitCrossword from "../hooks/useSubmitCrossword";
import TopHeader from "../pages/TopHeader";

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

  // ⭐ freeze timer when submit or puzzle completes
  const [timerRunning, setTimerRunning] = useState(true);

  const [completedAnswers, setCompletedAnswers] = useState({});
  const [completedWords, setCompletedWords] = useState({});
  const [progress, setProgress] = useState(0);

  const { submitScore } = useSubmitCrossword();

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

  const puzzle = useMemo(() => {
    if (!rawWordsArray) return null;
    try {
      return layoutToCrossword(rawWordsArray);
    } catch (e) {
      console.error("layoutToCrossword error", e);
      return null;
    }
  }, [rawWordsArray]);

  useEffect(() => {
    if (!theme) return;
    const wordCount = Object.keys(completedWords).length;
    const pointsPerWord = Number(theme.points);
    setScore(wordCount * pointsPerWord);
  }, [completedWords, theme]);

  useEffect(() => {
    if (!theme) return;

    if (theme.use_timeout === true || theme.use_timeout === "true") {
      setTimerSec(parseTimerString(theme.timer));
    } else {
      setTimerSec(0);
    }
  }, [theme]);

  useEffect(() => {
    if (!theme) return;
    if (!timerRunning) return;

    let tid;

    if (theme.use_timeout === true || theme.use_timeout === "true") {
      tid = setInterval(() => {
        setTimerSec((s) => {
          if (s <= 1) {
            clearInterval(tid);
            setTimerRunning(false);

            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      tid = setInterval(() => {
        setTimerSec((s) => s + 1);
      }, 1000);
    }

    return () => clearInterval(tid);
  }, [theme, timerRunning]);

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

  const totalPossibleScore = puzzle
    ? (Object.keys(puzzle.across).length + Object.keys(puzzle.down).length) *
      Number(theme.points)
    : 0;

  const submitGameResult = async () => {
    setTimerRunning(false);

    console.log("CHECK LOCALSTORAGE:", {
      sessionId: localStorage.getItem("sessionId"),
      organizationId: localStorage.getItem("organizationId"),
      gameId: localStorage.getItem("gameId"),
      userId: localStorage.getItem("userId"),
      role: localStorage.getItem("role"),
      email: localStorage.getItem("email"),
    });

    const formattedTime = formatTime(timerSec);
    const payload = generateSubmitPayload(score, formattedTime);

    console.log("FINAL SUBMISSION PAYLOAD:", payload);

    // ⭐ SAVE score and time to localStorage BEFORE redirect
    localStorage.setItem("finalScore", score.toString());
    localStorage.setItem("finalTime", formattedTime);
    localStorage.setItem("totalPoints", totalPossibleScore.toString());

    console.log("✅ Saved to localStorage:", {
      finalScore: score,
      finalTime: formattedTime,
      totalPoints: totalPossibleScore,
    });

    const result = await submitScore(payload);

    console.log("API RESULT:", result);

    // Auto-redirect after submission
    window.location.href = "/thankyou";
  };

  // ⭐ Show loading state while theme is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading game...</p>
        </div>
      </div>
    );
  }

  // ⭐ Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600">Failed to load theme</p>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ⭐ Show message if no puzzle data
  if (!rawWordsArray) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">
            Puzzle data missing in theme
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
      <TopHeader />
      <div className="w-[90%] max-w-[1400px] flex flex-col">
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
                    const percentage = (completedCount / totalCount) * 100;
                    setProgress(percentage);
                  }}
                />
              </div>

              <div className="flex-1 text-left max-w-[500px] mx-auto">
                <h3 className="text-2xl font-semibold">Across</h3>
                <ul className="mt-2 space-y-3">
                  {Object.entries(puzzle.across).map(([num, d]) => {
                    return (
                      <li key={num} className="leading-snug flex flex-col">
                        <div className="flex">
                          <strong className="mr-1">{num}.</strong>
                          <span>{d.clue}</span>

                          {completedAnswers[num] && (
                            <span className="text-green-700 ml-2">
                              {completedAnswers[num]}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <h3 className="text-2xl font-semibold mt-8">Down</h3>
                <ul className="mt-2 space-y-3">
                  {Object.entries(puzzle.down).map(([num, d]) => {
                    return (
                      <li key={num} className="leading-snug flex flex-col">
                        <div className="flex">
                          <strong className="mr-1">{num}.</strong>
                          <span>{d.clue}</span>

                          {completedAnswers[num] && (
                            <span className="text-green-700 ml-2">
                              {completedAnswers[num]}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      submitGameResult();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}