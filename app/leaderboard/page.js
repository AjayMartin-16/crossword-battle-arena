"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function LeaderboardPage() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const q = query(collection(db, "games"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const gamesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGames(gamesList);
    };
    fetchGames();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏆 Leaderboard</h2>
      <Link href="/">
        <button style={styles.backButton}>← Back to Home</button>
      </Link>

      {games.length === 0 ? (
        <p style={styles.noData}>No games played yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Game ID</th>
              <th style={styles.th}>Puzzle</th>
              <th style={styles.th}>Player Score</th>
              <th style={styles.th}>AI Score</th>
              <th style={styles.th}>Winner</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td style={styles.td}>{game.id}</td>
                <td style={styles.td}>{game.puzzle_id}</td>
                <td style={styles.td}>{game.player_score}</td>
                <td style={styles.td}>{game.ai_score}</td>
                <td style={styles.td}>
                  {game.winner ? (game.winner === "player" ? "You" : "AI") : "-"}
                </td>
                <td style={styles.td}>{game.game_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  backButton: {
    marginBottom: "20px",
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  noData: {
    fontSize: "1.2rem",
    color: "#777",
  },
  table: {
    borderCollapse: "collapse",
    backgroundColor: "white",
    color: "#333",
    width: "90%",
    maxWidth: "800px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  headerRow: {
    backgroundColor: "#f4f4f4",
  },
  th: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "center",
  },
  td: {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "center",
  },
};
