import { useReducer } from "react";
import Game, { getDefaultsForDate, highScore } from "./Game";
import { cn } from "./lib/utils";

export default function App() {
  const date = new Date();

  const checkHighScore = useReducer(() => ({}), {})[1];
  const score = highScore.get(date);
  return (
    <div className="flex flex-col">
      <header
        className={cn(
          "w-full flex items-center justify-between py-4 px-6 xl:px-8",
          "bg-neutral-100",
        )}
      >
        <h1 className="font-bold text-xl">Pack Words</h1>
        <p className="xl:block hidden">
          Your high score for {formatter.format(date)} - {score}
        </p>
        <p className="xl:hidden">
          {formatter.format(date)} - {score}
        </p>
      </header>
      <main className="w-screen xl:h-screen flex items-center justify-center">
        <div className="p-6 xl:p-8 w-full max-w-xl">
          <Game
            onFinish={() => checkHighScore()}
            defaults={getDefaultsForDate(date)}
          />
        </div>
      </main>
    </div>
  );
}

const formatter = new Intl.DateTimeFormat();
