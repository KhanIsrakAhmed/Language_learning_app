
import { Puzzle, X, Dice4, Calculator, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WordPuzzle } from "@/components/games/WordPuzzle";
import { TicTacToe } from "@/components/games/TicTacToe";
import { NumberCube } from "@/components/games/NumberCube";
import { MagicSquare } from "@/components/games/MagicSquare";
import { GameProvider } from "@/contexts/GameContext";
import { useGame } from "@/contexts/GameContext";

const GameLayout = () => {
  const { selectedGame, setSelectedGame, timer } = useGame();

  const games = [
    {
      title: "Word Puzzle",
      description: "Guess the hidden English word",
      icon: Puzzle,
      id: "word-puzzle"
    },
    {
      title: "Tic Tac Toe",
      description: "Classic X and O game",
      icon: X,
      id: "tic-tac-toe"
    },
    {
      title: "Number Cube",
      description: "Roll the dice and test your luck",
      icon: Dice4,
      id: "number-cube"
    },
    {
      title: "Magic Square",
      description: "Make rows, columns, and diagonals sum to target",
      icon: Calculator,
      id: "magic-square"
    },
    {
      title: "Magic Path",
      description: "Find the path with the correct sum",
      icon: Route,
      id: "magic-path"
    }
  ];

  const renderGame = () => {
    switch (selectedGame) {
      case "word-puzzle":
        return <WordPuzzle />;
      case "tic-tac-toe":
        return <TicTacToe />;
      case "number-cube":
        return <NumberCube />;
      case "magic-square":
        return <MagicSquare />;
      case "magic-path":
        return (
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Magic Path</h2>
            <p className="text-center text-gray-600">Coming Soon!</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gamification</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Learn while having fun</p>
        {selectedGame && (
          <p className="text-lg text-primary">Timer: {timer}s</p>
        )}
      </div>

      {!selectedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <game.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{game.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setSelectedGame(null)}
          >
            Back to Games
          </Button>
          {renderGame()}
        </div>
      )}
    </div>
  );
};

const Gamification = () => {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
};

export default Gamification;
