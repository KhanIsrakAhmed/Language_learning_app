
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

export const WordPuzzle = () => {
  const { wordToGuess, guessedLetters, handleWordGuess } = useGame();

  const handleSubmit = () => {
    const allLettersGuessed = wordToGuess.split('').every(l => guessedLetters.includes(l));
    if (allLettersGuessed) {
      toast.success("Well done! +50 XP");
    } else {
      toast.error("Keep trying! Some letters are still missing.");
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Word Puzzle</h2>
      <div className="flex justify-center gap-2">
        {wordToGuess.split('').map((letter, index) => (
          <div
            key={index}
            className="w-10 h-10 border-2 border-primary flex items-center justify-center font-bold text-xl"
          >
            {guessedLetters.includes(letter) ? letter : '_'}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
          <Button
            key={letter}
            onClick={() => handleWordGuess(letter)}
            disabled={guessedLetters.includes(letter)}
            variant="outline"
            className="w-10 h-10 p-0"
          >
            {letter}
          </Button>
        ))}
      </div>
      <Button onClick={handleSubmit} className="w-full">Submit Answer</Button>
    </Card>
  );
};
