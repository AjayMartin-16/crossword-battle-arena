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
    <div style={{ textAlign: "center", color: "white", padding: "20px" }}>
      <h2>🏆 Leaderboard</h2>
      <Link href="/">
        <button style={{ marginBottom: "20px" }}>← Back to Home</button>
      </Link>

      {games.length === 0 ? (
        <p>No games played yet.</p>
      ) : (
        <table
          style={{
            margin: "0 auto",
            borderCollapse: "collapse",
            backgroundColor: "#222",
            color: "white",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#444" }}>
              <th style={thStyle}>Game ID</th>
              <th style={thStyle}>Puzzle</th>
              <th style={thStyle}>Player Score</th>
              <th style={thStyle}>AI Score</th>
              <th style={thStyle}>Winner</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td style={tdStyle}>{game.id}</td>
                <td style={tdStyle}>{game.puzzle_id}</td>
                <td style={tdStyle}>{game.player_score}</td>
                <td style={tdStyle}>{game.ai_score}</td>
                <td style={tdStyle}>
                  {game.winner ? (game.winner === "player" ? "You" : "AI") : "-"}
                </td>
                <td style={tdStyle}>{game.game_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #666",
  padding: "8px",
};

const tdStyle = {
  border: "1px solid #666",
  padding: "8px",
};
