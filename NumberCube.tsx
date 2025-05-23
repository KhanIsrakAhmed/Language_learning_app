
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

export const NumberCube = () => {
  const { diceNumber, rollDice } = useGame();

  const handleSubmit = () => {
    if (diceNumber === 6) {
      toast.success("Lucky roll! +60 XP");
    } else if (diceNumber > 3) {
      toast.success("Good roll! +30 XP");
    } else {
      toast.info("Keep rolling! +10 XP");
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Number Cube</h2>
      <div className="flex justify-center">
        <div className="w-32 h-32 border-4 border-primary rounded-lg flex items-center justify-center">
          <span className="text-6xl font-bold">{diceNumber}</span>
        </div>
      </div>
      <Button onClick={rollDice} className="w-full">Roll Dice</Button>
      <Button onClick={handleSubmit} className="w-full">Submit Roll</Button>
    </Card>
  );
};
