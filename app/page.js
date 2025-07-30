"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Crossword Battle Arena</h1>
      <p>Select difficulty to start:</p>

      <div style={{ marginTop: "20px" }}>
        <Link href="/game?difficulty=easy">
          <button style={{ margin: "10px" }}>Easy</button>
        </Link>
        <Link href="/game?difficulty=medium">
          <button style={{ margin: "10px" }}>Medium</button>
        </Link>
        <Link href="/game?difficulty=hard">
          <button style={{ margin: "10px" }}>Hard</button>
        </Link>
      </div>

      <Link href="/leaderboard">
        <button style={{ marginTop: "30px" }}>🏆 View Leaderboard</button>
      </Link>
    </div>
  );
}
