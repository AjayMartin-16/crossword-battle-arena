"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { puzzles } from "../../utils/puzzles";
import { getAITaunt } from "../../utils/grok";

// Firebase
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function GamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const difficulty = searchParams.get("difficulty") || "easy";
  const inputRef = useRef(null);

  const puzzle = puzzles[difficulty][0];
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [solvedWords, setSolvedWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [typedWord, setTypedWord] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [chat, setChat] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const [gameId, setGameId] = useState(null);
  const [aiShouldWin, setAiShouldWin] = useState(Math.random() > 0.5);

  // ---------------- INIT ----------------
  useEffect(() => {
    if (!puzzle) return;
    const gridArr = Array(puzzle.gridSize)
      .fill(null)
      .map(() => Array(puzzle.gridSize).fill(""));
    puzzle.words.forEach((word) => {
      for (let i = 0; i < word.word.length; i++) {
        const r = word.row + (word.horizontal ? 0 : i);
        const c = word.col + (word.horizontal ? i : 0);
        gridArr[r][c] = "";
      }
    });
    setGrid(gridArr);
    setWords(puzzle.words);
    setSolvedWords([]);
    setPlayerScore(0);
    setAiScore(0);
    setTypedWord("");
    setSelectedWord(null);
    setCurrentTurn(null);
    setTimeLeft(20);
    setGameOver(false);
    setStarted(false);
  }, [puzzle]);

  // ---------------- START ----------------
  const startGame = async () => {
    const userFirst = window.confirm("Do you want to play first?");
    setCurrentTurn(userFirst ? "player" : "ai");
    setTimeLeft(20);
    setStarted(true);

    // Create new game in Firestore
    const gameRef = await addDoc(collection(db, "games"), {
      puzzle_id: puzzle.id,
      player_score: 0,
      ai_score: 0,
      game_status: "active",
      winner: null,
      solved_words: [],
      created_at: serverTimestamp(),
    });
    setGameId(gameRef.id);
  };

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!started || gameOver) return;
    if (timeLeft <= 0) {
      switchTurn();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, started, currentTurn, gameOver]);

  const switchTurn = () => {
    setTimeLeft(20);
    setSelectedWord(null);
    setTypedWord("");
    setCurrentTurn((prev) => (prev === "player" ? "ai" : "player"));
  };

  // ---------------- FIREBASE ----------------
  const updateFirebaseState = async (winner = null) => {
    if (!gameId) return;
    await updateDoc(doc(db, "games", gameId), {
      player_score: playerScore,
      ai_score: aiScore,
      solved_words: solvedWords,
      game_status: winner ? "completed" : "active",
      winner: winner || null,
    });
  };

  const addChat = async (msg) => {
    setChat((prev) => [...prev, msg]);
    if (gameId) {
      await addDoc(collection(db, "chat_messages", gameId, "messages"), {
        sender: msg.startsWith("AI") ? "ai" : "player",
        message: msg,
        timestamp: serverTimestamp(),
      });
    }
  };

  // ---------------- SELECT WORD ----------------
  const handleSelectWord = (word) => {
    if (gameOver || currentTurn !== "player") return;
    if (solvedWords.includes(word.id)) return;
    setSelectedWord(word);
    setTypedWord("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!selectedWord || gameOver || currentTurn !== "player") return;

    if (typedWord.toUpperCase() === selectedWord.word) {
      setSolvedWords((prev) => [...prev, selectedWord.id]);
      setPlayerScore((prev) => prev + 10);
      addChat(`You: Solved ${selectedWord.word}`);
      updateGridWithWord(selectedWord.word, selectedWord);
    } else {
      addChat("You: Wrong answer");
    }

    await updateFirebaseState();

    setSelectedWord(null);
    setTypedWord("");

    if (solvedWords.length + 1 === words.length) {
      endGame("player");
    } else {
      switchTurn();
    }
  };

  // ---------------- GRID UPDATE ----------------
  const updateGridWithWord = (word, wordObj) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      for (let i = 0; i < word.length; i++) {
        const row = wordObj.row + (wordObj.horizontal ? 0 : i);
        const col = wordObj.col + (wordObj.horizontal ? i : 0);
        newGrid[row][col] = word[i];
      }
      return newGrid;
    });
  };

  // ---------------- AI LOGIC ----------------
  const handleAISolve = useCallback(async () => {
    if (gameOver || currentTurn !== "ai") return;

    const unsolved = words.filter((w) => !solvedWords.includes(w.id));
    if (unsolved.length === 0) {
      endGame("ai");
      return;
    }

    // Random skip logic
    if (!aiShouldWin && Math.random() < 0.3) {
      addChat("AI: Hmm... I'll skip!");
      switchTurn();
      return;
    }

    const chosenWord = unsolved[Math.floor(Math.random() * unsolved.length)];
    updateGridWithWord(chosenWord.word, chosenWord);

    setSolvedWords((prev) => [...prev, chosenWord.id]);
    setAiScore((prev) => prev + 10);

    const taunt = await getAITaunt(
      `I just solved ${chosenWord.word}! ${
        aiScore > playerScore ? "I'm winning!" : "I need to catch up!"
      }`
    );
    addChat(`AI: ${taunt}`);

    await updateFirebaseState();

    if (solvedWords.length + 1 === words.length) {
      endGame("ai");
    } else {
      switchTurn();
    }
  }, [currentTurn, solvedWords, words, aiScore, playerScore, gameOver]);

  useEffect(() => {
    if (currentTurn === "ai" && !gameOver && started) {
      handleAISolve();
    }
  }, [currentTurn, handleAISolve, gameOver, started]);

  // ---------------- END GAME ----------------
  const endGame = async (winner = null) => {
    setGameOver(true);

    let result = "";
    if (winner === "player") {
      result = "🎉 You Win!";
    } else if (winner === "ai") {
      result = "🤖 AI Wins!";
    } else {
      if (playerScore > aiScore) result = "🎉 You Win!";
      else if (aiScore > playerScore) result = "🤖 AI Wins!";
      else result = aiShouldWin ? "🤖 AI Wins!" : "🎉 You Win!";
    }

    await updateFirebaseState(winner);

    setTimeout(() => {
      if (
        window.confirm(
          `${result}\n\nPlayer: ${playerScore} | AI: ${aiScore}\n\nPlay again?`
        )
      ) {
        router.push("/");
      }
    }, 300);
  };

  // ---------------- RENDER ----------------
  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h2>Crossword Battle Arena ({difficulty})</h2>
      {!started && (
        <button onClick={startGame} style={{ margin: "10px" }}>
          Start Game
        </button>
      )}

      {started && (
        <>
          <h3 style={{ color: "yellow" }}>
            Player: {playerScore} | AI: {aiScore} | Time: {timeLeft}
          </h3>
          <h3 style={{ color: "orange" }}>
            {currentTurn === "player" ? "👉 Your turn" : "🤖 AI turn"}
          </h3>
        </>
      )}

      {/* GRID */}
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${puzzle.gridSize}, 40px)`,
          gridGap: "2px",
          margin: "15px auto",
          backgroundColor: "#000",
          padding: "5px",
        }}
      >
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const wordAt = words.find((w) => {
              for (let i = 0; i < w.word.length; i++) {
                const rr = w.row + (w.horizontal ? 0 : i);
                const cc = w.col + (w.horizontal ? i : 0);
                if (rr === rIdx && cc === cIdx) return true;
              }
              return false;
            });
            const number =
              wordAt && wordAt.row === rIdx && wordAt.col === cIdx
                ? wordAt.id
                : "";

            const isActiveCell =
              selectedWord &&
              wordAt &&
              selectedWord.id === wordAt.id &&
              currentTurn === "player";

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() => wordAt && handleSelectWord(wordAt)}
                style={{
                  width: 40,
                  height: 40,
                  border: "1px solid #999",
                  backgroundColor: wordAt
                    ? isActiveCell
                      ? "#666600"
                      : "#333"
                    : "#000",
                  position: "relative",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: wordAt ? "pointer" : "default",
                }}
              >
                {number && (
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 4,
                      fontSize: "10px",
                      color: "yellow",
                    }}
                  >
                    {number}
                  </span>
                )}
                {cell}
              </div>
            );
          })
        )}
      </div>

      {started && (
        <div>
          <input
            ref={inputRef}
            type="text"
            value={typedWord}
            onChange={(e) => setTypedWord(e.target.value.toUpperCase())}
            disabled={currentTurn !== "player" || !selectedWord}
          />
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={switchTurn}>Pass Turn</button>
          <button onClick={() => router.push("/")}>New Game</button>
        </div>
      )}

      {/* CLUES */}
      {started && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "15px",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <b>Across</b>
            <ul style={{ listStyle: "none" }}>
              {words
                .filter((w) => w.horizontal)
                .map((w) => (
                  <li
                    key={w.id}
                    onClick={() => handleSelectWord(w)}
                    style={{
                      cursor: "pointer",
                      color: solvedWords.includes(w.id) ? "gray" : "yellow",
                    }}
                  >
                    {w.id}. {w.clue}
                  </li>
                ))}
            </ul>
          </div>
          <div style={{ textAlign: "left" }}>
            <b>Down</b>
            <ul style={{ listStyle: "none" }}>
              {words
                .filter((w) => !w.horizontal)
                .map((w) => (
                  <li
                    key={w.id}
                    onClick={() => handleSelectWord(w)}
                    style={{
                      cursor: "pointer",
                      color: solvedWords.includes(w.id) ? "gray" : "yellow",
                    }}
                  >
                    {w.id}. {w.clue}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* CHAT */}
      <div style={{ marginTop: "20px" }}>
        <b>Chat</b>
        <ul style={{ listStyle: "none" }}>
          {chat.map((c, idx) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
