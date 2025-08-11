"use client";
import dynamic from "next/dynamic";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { puzzles } from "../../utils/puzzles";
import { getAITaunt } from "../../utils/grok";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

function GamePageInner() {
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

  const startGame = async () => {
    const userFirst = window.confirm("Do you want to play first?");
    setCurrentTurn(userFirst ? "player" : "ai");
    setTimeLeft(20);
    setStarted(true);

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

  const handleSelectWord = (word) => {
    if (gameOver || currentTurn !== "player") return;
    if (solvedWords.includes(word.id)) return;
    setSelectedWord(word);
    setTypedWord("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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

  const handleAISolve = useCallback(async () => {
    if (gameOver || currentTurn !== "ai") return;

    const unsolved = words.filter((w) => !solvedWords.includes(w.id));
    if (unsolved.length === 0) {
      endGame("ai");
      return;
    }

    if (!aiShouldWin && Math.random() < 0.3) {
      addChat("AI: Hmm... I'll skip!");
      setTimeout(() => {
        switchTurn();
      }, 500);
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

    setTimeout(() => {
      switchTurn();
    }, 800);
  }, [currentTurn, solvedWords, words, aiScore, playerScore, gameOver, aiShouldWin]);

  useEffect(() => {
    if (currentTurn === "ai" && !gameOver && started) {
      const aiMoveTimeout = setTimeout(() => {
        handleAISolve();
      }, 1000);
      return () => clearTimeout(aiMoveTimeout);
    }
  }, [currentTurn, handleAISolve, gameOver, started]);

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

  
// Common button style
const buttonStyle = {
  padding: "8px 15px",
  margin: "5px",
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

  return (
  <div
    style={{
      minHeight: "100vh",
      backgroundColor: "white",
      color: "#222",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
    }}
  >
    <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
      Crossword Battle Arena ({difficulty})
    </h2>

    {!started && (
      <button
        onClick={startGame}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
          margin: "10px 0",
        }}
      >
        Start Game
      </button>
    )}

    {started && (
      <>
        <h3 style={{ color: "#333", fontWeight: "500" }}>
          Player: {playerScore} | AI: {aiScore} | Time: {timeLeft}
        </h3>
        <h3
          style={{
            color: currentTurn === "player" ? "#4CAF50" : "#F44336",
            fontWeight: "bold",
          }}
        >
          {currentTurn === "player" ? "👉 Your turn" : "🤖 AI turn"}
        </h3>
      </>
    )}

    {/* Crossword Grid */}
    <div
  style={{
    display: "inline-grid",
    gridTemplateColumns: `repeat(${puzzle.gridSize}, 40px)`,
    gridGap: "2px",
    margin: "15px auto",
    backgroundColor: "#000",
    padding: "5px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  }}
>
  {Array.from({ length: puzzle.gridSize }).map((_, rIdx) =>
    Array.from({ length: puzzle.gridSize }).map((_, cIdx) => {
      // Check if a word exists at this cell
      const wordAtCell = words.find(
        (w) =>
          rIdx >= w.row &&
          rIdx < w.row + (w.horizontal ? 1 : w.word.length) &&
          cIdx >= w.col &&
          cIdx < w.col + (w.horizontal ? w.word.length : 1)
      );

      const isBlack = !wordAtCell;
      const isSolved = wordAtCell && solvedWords.includes(wordAtCell.id);

      let letter = "";
      if (isSolved && wordAtCell) {
        const offset = wordAtCell.horizontal
          ? cIdx - wordAtCell.col
          : rIdx - wordAtCell.row;
        letter = wordAtCell.word[offset];
      }

      return (
        <div
          key={`${rIdx}-${cIdx}`}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: isBlack ? "#333" : "#fff",
            border: "1px solid #000",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
            cursor:
              !isBlack && currentTurn === "player"
                ? "pointer"
                : "default",
          }}
          onClick={() => {
            if (wordAtCell && !isBlack && currentTurn === "player") {
              handleSelectWord(wordAtCell);
            }
          }}
        >
          {letter}
        </div>
      );
    })
  )}
</div>

    {/* Input & Buttons */}
    {started && (
      <div style={{ marginTop: "15px" }}>
        <input
          ref={inputRef}
          type="text"
          value={typedWord}
          onChange={(e) => setTypedWord(e.target.value.toUpperCase())}
          disabled={currentTurn !== "player" || !selectedWord}
          style={{
            padding: "8px",
            fontSize: "1rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button style={buttonStyle} onClick={handleSubmit}>Submit</button>
        <button style={buttonStyle} onClick={switchTurn}>Pass Turn</button>
        <button style={buttonStyle} onClick={() => router.push("/")}>New Game</button>
      </div>
    )}

    {/* Clues */}
    {started && (
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "20px",
          textAlign: "left",
          maxWidth: "800px",
          marginInline: "auto",
        }}
      >
        <div>
          <b>Across</b>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {words
              .filter((w) => w.horizontal)
              .map((w) => (
                <li
                  key={w.id}
                  onClick={() => handleSelectWord(w)}
                  style={{
                    cursor: "pointer",
                    color: solvedWords.includes(w.id) ? "#bbb" : "#333",
                  }}
                >
                   {w.id}. {w.clue} ({w.word.length} letters)
                </li>
              ))}
          </ul>
        </div>
        <div>
          <b>Down</b>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {words
              .filter((w) => !w.horizontal)
              .map((w) => (
                <li
                  key={w.id}
                  onClick={() => handleSelectWord(w)}
                  style={{
                    cursor: "pointer",
                    color: solvedWords.includes(w.id) ? "#bbb" : "#333",
                  }}
                >
                  {w.id}. {w.clue} ({w.word.length} letters)
                </li>
              ))}
          </ul>
        </div>
      </div>
    )}

    {/* Chat */}
    <div style={{ marginTop: "20px", maxWidth: "600px", marginInline: "auto" }}>
      <b>Chat</b>
      <ul style={{ listStyle: "none", padding: 0, color: "#555" }}>
        {chat.map((c, idx) => (
          <li key={idx}>{c}</li>
        ))}
      </ul>
    </div>
  </div>
);


}

export default function GamePage() {
  return (
    <Suspense fallback={<div style={{ color: "white" }}>Loading...</div>}>
      <GamePageInner />
    </Suspense>
  );
}
