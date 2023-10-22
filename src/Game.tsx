import { useState } from "react";
import { AspectRatio } from "./components/ui/aspect-ratio";
import { cn } from "./lib/utils";

const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 7;

type Cell = string | null;
type Board = Cell[][];

const defaultBoard: Board = Array.from({ length: BOARD_HEIGHT }, () =>
  Array.from({ length: BOARD_WIDTH }, () => null),
);
// Add a few random chars
defaultBoard[2][4] = "M";
defaultBoard[0][1] = "C";

const styles = {
  border: "border-2 border-neutral-200",
  button: cn(
    "bg-neutral-200 font-bold xl:text-xl py-2 xl:py-3 px-8",
    "hover:bg-neutral-300 active:bg-neutral-400",
    "border-4 border-neutral-200",
    "hover:border-neutral-300 active:border-neutral-400",
  ),
  secondaryButton: cn(
    "border-4 border-neutral-200",
    "font-bold xl:text-xl py-2 xl:py-3 px-8",
    "hover:bg-neutral-200 active:bg-neutral-300",
  ),
};

type Score = {
  word: string;
  score: number;
};

const defaults = {
  board: defaultBoard,
  boardKey: JSON.stringify(defaultBoard),
  lastScores: [] as Score[],
  olderScores: [] as Score[],
};

/**
 * Scrabble + Sudoku
 */
export default function Game({ onFinish }: { onFinish: () => void }) {
  const [board, setBoard] = useState(defaults.board);
  const [lastScores, setLastScores] = useState<Score[]>(defaults.lastScores);
  const [olderScores, setOlderScores] = useState<Score[]>(defaults.olderScores);

  // TODO put this on board and account in scoring
  // TODO add combo multiplier system too?
  // const [multipliers] = useState([
  //   { x: 3, y: 4, by: 2 },
  //   { x: 5, y: 6, by: 2 },
  // ]);

  const scores = [...lastScores, ...olderScores];
  const totalScore = scores.reduce((acc, { score }) => acc + score, 0);

  const boardKey = JSON.stringify(board);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.target as HTMLFormElement);
        const newBoard = board.map((row, y) =>
          row.map((cell, x) => {
            const v = form.get(`cell-${x}-${y}`)?.toString();
            return v ? v : cell;
          }),
        );
        const previousWords = await getWords(board);
        const newWords = (await getWords(newBoard)).filter(
          (w) => !previousWords.includes(w),
        );
        // TODO: ensure only 1 word was entered
        setBoard(newBoard);

        const newScores = newWords.map((word) => ({
          word,
          score: word.length,
        }));
        setOlderScores([...lastScores, ...olderScores]);
        setLastScores(newScores);
      }}
    >
      <div className="flex flex-col-reverse xl:flex-row gap-8 w-full">
        <div className="min-w-[90px] space-y-8">
          <div>
            <p className="text-lg font-bold text-neutral-400">Score</p>
            <p className="font-bold text-2xl text-right">
              {totalScore.toString().padStart(4, "0")}
            </p>
          </div>
          <div className="space-y-1 font-bold">
            {lastScores.map(({ word, score }, i) => (
              <div key={i} className="flex justify-between">
                <p>{wordCase(word)}</p>
                <p>{score}</p>
              </div>
            ))}
            {olderScores
              .slice(0, 10 - lastScores.length)
              .map(({ word, score }, i) => (
                <div
                  key={i}
                  className="flex justify-between text-neutral-400"
                  style={{
                    opacity: (10 - (lastScores.length + i)) / 10,
                  }}
                >
                  <p>{wordCase(word)}</p>
                  <p>{score}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="flex-grow flex flex-col gap-4">
          <div
            className={cn("grid flex-grow", styles.border)}
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            }}
          >
            {board.map((row, y) =>
              row.map((cell, x) => (
                <Cell key={`${x}${y}${boardKey}`} cell={cell} x={x} y={y} />
              )),
            )}
          </div>
          <div className="flex justify-end gap-4">
            {boardKey !== defaults.boardKey && (
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  highScore.set(new Date(), totalScore);
                  onFinish();
                  setBoard(defaults.board);
                  setLastScores(defaults.lastScores);
                  setOlderScores(defaults.olderScores);
                }}
              >
                Finish
              </button>
            )}
            <button className={styles.button} type="submit">
              Lock In
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Cell({ cell, x, y }: { cell: Cell; x: number; y: number }) {
  const [value, setValue] = useState("");

  return (
    <div className={cn(styles.border)}>
      <AspectRatio
        ratio={1}
        className={cn(
          "flex items-center justify-center",
          cell && "bg-neutral-200",
        )}
      >
        {cell ? (
          <p className="text-center text-2xl xl:text-3xl uppercase font-bold">
            {cell}
          </p>
        ) : (
          <input
            className="w-full h-full text-center text-2xl xl:text-3xl uppercase font-bold"
            type="text"
            value={value}
            id={`cell-${x}-${y}`}
            name={`cell-${x}-${y}`}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().slice(-1);
              setValue(v);
            }}
          />
        )}
      </AspectRatio>
    </div>
  );
}

const checkedWords: Record<string, boolean> = {};
async function isValidWord(word: string): Promise<boolean> {
  if (word.length < 3) return false;
  if (word in checkedWords) return checkedWords[word];
  const escapedWord = encodeURIComponent(word);
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${escapedWord}`,
  );
  const isValid = res.ok;
  checkedWords[word] = isValid;
  return isValid;
}

async function getWords(board: Board) {
  const words: string[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    let word = "";
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = board[y][x];
      if (cell) {
        word += cell;
      } else if (word) {
        if (await isValidWord(word)) {
          words.push(word);
        }
        word = "";
      }
    }
    if (word && (await isValidWord(word))) {
      words.push(word);
    }
  }
  for (let x = 0; x < BOARD_WIDTH; x++) {
    let word = "";
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      const cell = board[y][x];
      if (cell) {
        word += cell;
      } else if (word) {
        if (await isValidWord(word)) {
          words.push(word);
        }
        word = "";
      }
    }
    if (word && (await isValidWord(word))) {
      words.push(word);
    }
  }
  return words;
}

function wordCase(word: string) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

const highScoreDateFormatter = new Intl.DateTimeFormat("en-US");
export const highScore = {
  get: (date: Date) => {
    const json = localStorage.getItem(`highScore`);
    if (!json) return 0;
    try {
      const data = JSON.parse(json);
      const key = highScoreDateFormatter.format(date);
      const n = data[key];
      if (typeof n !== "number") return 0;
      return n;
    } catch {
      return 0;
    }
  },
  set: (date: Date, score: number) => {
    let done = false;
    const json = localStorage.getItem(`highScore`);
    if (json) {
      try {
        const data = JSON.parse(json);
        const key = highScoreDateFormatter.format(date);
        const n = data[key];
        if (typeof n === "number" && n >= score) {
          done = true;
        } else {
          localStorage.setItem(
            `highScore`,
            JSON.stringify({
              ...data,
              [key]: score,
            }),
          );
          done = true;
        }
      } catch {}
    }
    if (!done) {
      const key = highScoreDateFormatter.format(date);
      localStorage.setItem(
        `highScore`,
        JSON.stringify({
          [key]: score,
        }),
      );
    }
  },
};
