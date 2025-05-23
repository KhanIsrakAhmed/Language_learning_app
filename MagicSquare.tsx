
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

export const MagicSquare = () => {
  const {
    magicSquare,
    targetSum,
    timer,
    bestTime,
    xpPoints,
    handleMagicSquareInput,
    handleMagicSquareComplete
  } = useGame();

  const handleSubmit = () => {
    const timeBonus = Math.max(100 - timer, 0);
    if (timeBonus > 50) {
      toast.success(`Amazing speed! +${timeBonus + 100} XP`);
    } else if (timeBonus > 25) {
      toast.success(`Well done! +${timeBonus + 50} XP`);
    } else {
      toast.success(`Completed! +${timeBonus + 25} XP`);
    }
    handleMagicSquareComplete();
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Magic Square</h2>
      <div className="text-center space-y-2">
        <p className="text-lg">Target Sum: {targetSum}</p>
        <p className="text-primary">Time: {timer}s</p>
        {bestTime !== Infinity && <p>Best Time: {bestTime}s</p>}
        <p className="text-green-500">XP Points: {xpPoints}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
        {magicSquare.map((num, index) => (
          <input
            key={index}
            type="number"
            value={num || ''}
            onChange={(e) => handleMagicSquareInput(index, e.target.value)}
            className="w-20 h-20 text-2xl font-bold text-center border-2 border-primary rounded"
            min="0"
            max="9"
          />
        ))}
      </div>
      <Button onClick={handleSubmit} className="w-full">Submit Solution</Button>
    </Card>
  );
};
