import { InfoIcon } from "lucide-react";
import { useReducer } from "react";
import { Button } from "./components/ui/button";
import { Alert, useAlert } from "./components/useAlert";
import Game, { getDefaultsForDate, highScore } from "./Game";
import { cn } from "./lib/utils";

const howToPlay: Alert = {
  title: "How To Play",
  description: (
    <div className="space-y-4">
      <p>
        Pack Words is a word game where you have to pack as many words as you
        can into a grid.
      </p>
      <p>
        You can only lock in one word at a time, and it must be at least 3
        letters long. Words can only be placed horizontally or vertically from
        left to right and top to bottom.
      </p>
      <p>
        You will receive points based on the new words you add when you lock in
        a word. Even though you can only write one word at a time, you can add
        multiple new words at once! You will receive a points based on the
        length of each new word.
      </p>
      <p></p>
    </div>
  ),
  actionText: "Got it!",
};

export default function App() {
  const date = new Date();

  const checkHighScore = useReducer(() => ({}), {})[1];
  const score = highScore.get(date);

  const hasPlayed = highScore.all();
  const { alert, element } = useAlert({
    defaultOpen: hasPlayed ? null : howToPlay,
  });

  return (
    <div className="flex flex-col xl:min-h-screen ">
      <header
        className={cn(
          "w-full flex items-center justify-between py-4 px-6 xl:px-8",
          "bg-neutral-100",
        )}
      >
        <div className="flex gap-4 xl:gap-8 items-center">
          <h1 className="font-bold xl:text-xl text-lg">Pack Words</h1>
          <Button
            variant="outline"
            className="hidden xl:block"
            onClick={() => alert(howToPlay)}
          >
            How To Play
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="xl:hidden"
            onClick={() => alert(howToPlay)}
          >
            <InfoIcon className="w-4 h-4" />
          </Button>
        </div>
        <p className="xl:block hidden text-sm">
          Your high score for {formatter.format(date)} - {score}
        </p>
        <p className="xl:hidden">
          {formatter.format(date)} - {score}
        </p>
      </header>
      <main className="w-screen flex-grow flex items-center justify-center">
        <div className="p-6 xl:p-8 w-full max-w-xl">
          <Game
            onFinish={() => checkHighScore()}
            defaults={getDefaultsForDate(date)}
          />
        </div>
      </main>
      {element}
    </div>
  );
}

const formatter = new Intl.DateTimeFormat();
