export const puzzles = {
  easy: [
    {
      id: "puzzle1",
      gridSize: 10,
      gridLayout: [
        [null, null, null, null, 2, null, null, null, null, null],
        [null, null, null, null, 'D', null, null, null, null, null],
        [1, 'C', 'A', 'T', 'G', null, null, null, null, null],
        [null, null, null, null, 'O', null, null, null, null, null],
        [3, 'B', 'I', 'R', 'D', null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      words: [
        { id: 1, word: "CAT", row: 2, col: 1, horizontal: true, clue: "Small pet animal" },
        { id: 2, word: "DOG", row: 1, col: 4, horizontal: false, clue: "Man's best friend" },
        { id: 3, word: "BIRD", row: 4, col: 1, horizontal: true, clue: "Has wings and can fly" },
      ]
    }
  ],
  medium: [
    {
      id: "puzzle2",
      gridSize: 10,
      gridLayout: [
        [null, null, null, null, 2, null, null, null, null, null],
        [1, 'T', 'I', 'G', 'E', 'R', null, null, null, null],
        [null, null, null, null, 'O', null, null, null, null, null],
        [null, null, null, null, 'H', null, null, null, null, null],
        [3, 'F', 'I', 'S', 'H', null, null, null, null, null],
        [null, null, null, null, 'E', null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      words: [
        { id: 1, word: "TIGER", row: 1, col: 1, horizontal: true, clue: "Big cat in jungle" },
        { id: 2, word: "HORSE", row: 0, col: 4, horizontal: false, clue: "Ridden by knights" },
        { id: 3, word: "FISH", row: 4, col: 1, horizontal: true, clue: "Lives in water" },
      ]
    }
  ],
  hard: [
    {
      id: "puzzle3",
      gridSize: 10,
      gridLayout: [
        [1, 'K', 'A', 'N', 'G', 'A', 'R', 'O', 'O', null],
        [null, null, null, null, null, null, null, null, null, null],
        [2, 'P', 'Y', 'T', 'H', 'O', 'N', null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [3, 'W', 'H', 'A', 'L', 'E', null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      words: [
        { id: 1, word: "KANGAROO", row: 0, col: 1, horizontal: true, clue: "Australian animal that hops" },
        { id: 2, word: "PYTHON", row: 2, col: 1, horizontal: true, clue: "Programming language or snake" },
        { id: 3, word: "WHALE", row: 4, col: 1, horizontal: true, clue: "Largest mammal in ocean" },
      ]
    }
  ]
};
