import React, { useEffect, useRef } from "react";

export default function CrosswordGrid({
  grid,
  activeCell,
  setActiveCell,
  activeWord,
  setActiveWord,
  lockedCells,
  handleCellInput,
  puzzleWords,
  handleSubmit
}) {
  const gridRef = useRef(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeCell) return;

      const { row, col } = activeCell;
      if (e.key === "ArrowUp") setActiveCell({ row: Math.max(0, row - 1), col });
      else if (e.key === "ArrowDown") setActiveCell({ row: Math.min(grid.length - 1, row + 1), col });
      else if (e.key === "ArrowLeft") setActiveCell({ row, col: Math.max(0, col - 1) });
      else if (e.key === "ArrowRight") setActiveCell({ row, col: Math.min(grid[0].length - 1, col + 1) });
      else if (e.key === "Enter") handleSubmit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCell, grid, handleSubmit, setActiveCell]);

  // Determine clue number for each cell
  const getClueNumber = (r, c) => {
    const word = puzzleWords.find(
      (w) =>
        (w.horizontal && w.row === r && w.col === c) ||
        (!w.horizontal && w.row === r && w.col === c)
    );
    return word ? word.id : "";
  };

  return (
    <div
      ref={gridRef}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${grid[0].length}, 40px)`,
        gap: "2px",
        justifyContent: "center",
        margin: "10px auto"
      }}
    >
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const isActive = activeCell?.row === rIdx && activeCell?.col === cIdx;
          const isLocked = lockedCells.some(([lr, lc]) => lr === rIdx && lc === cIdx);
          const clueNum = getClueNumber(rIdx, cIdx);

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              onClick={() => setActiveCell({ row: rIdx, col: cIdx })}
              style={{
                width: "40px",
                height: "40px",
                background: cell === "" ? "#111" : isLocked ? "#444" : "#222",
                border: isActive ? "2px solid yellow" : "1px solid gray",
                color: "#fff",
                position: "relative",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                lineHeight: "40px"
              }}
            >
              {/* Clue number */}
              {clueNum && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: "2px",
                    fontSize: "10px",
                    color: "yellow"
                  }}
                >
                  {clueNum}
                </span>
              )}

              {/* Letter */}
              {cell !== "_" ? cell : ""}
            </div>
          );
        })
      )}
    </div>
  );
}
