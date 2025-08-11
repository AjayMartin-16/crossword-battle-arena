"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Crossword Battle Arena</h1>
      <p style={styles.subtitle}>Select difficulty to start:</p>

      <div style={styles.buttonGroup}>
        <Link href="/game?difficulty=easy">
          <button style={styles.button}>Easy</button>
        </Link>
        <Link href="/game?difficulty=medium">
          <button style={styles.button}>Medium</button>
        </Link>
        <Link href="/game?difficulty=hard">
          <button style={styles.button}>Hard</button>
        </Link>
      </div>

      <Link href="/leaderboard">
        <button style={styles.leaderboardButton}>🏆 View Leaderboard</button>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "white",
    color: "#222",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "20px",
    color: "#555",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  leaderboardButton: {
    padding: "12px 24px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2196F3",
    color: "white",
    cursor: "pointer",
    transition: "background 0.3s",
  },
};
