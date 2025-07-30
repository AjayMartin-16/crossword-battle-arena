"use client";
import React from "react";

export default function Chat({ messages }) {
  return (
    <div style={{ marginTop: 20, padding: 10, border: "1px solid #555", maxHeight: 150, overflowY: "auto", background: "#222", color: "white" }}>
      {messages.map((m, idx) => (
        <p key={idx}><strong>{m.sender}:</strong> {m.message}</p>
      ))}
    </div>
  );
}
