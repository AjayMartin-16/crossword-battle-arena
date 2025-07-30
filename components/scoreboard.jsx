"use client";
import React from "react";

export default function Scoreboard({ playerScore, aiScore }) {
  return (
    <div style={{ color: "white", marginBottom: 15 }}>
      <strong>You:</strong> {playerScore} | <strong>AI:</strong> {aiScore}
    </div>
  );
}
