
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

export const TicTacToe = () => {
  const { board, handleTicTacToeClick, resetGame } = useGame();

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleSubmit = () => {
    const winner = calculateWinner(board);
    if (winner === 'X') {
      toast.success("Victory! +75 XP");
    } else if (winner === 'O') {
      toast.error("Better luck next time!");
    } else if (!board.includes(null)) {
      toast.info("It's a draw! +25 XP");
    } else {
      toast.error("Game is not finished yet!");
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Tic Tac Toe</h2>
      <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
        {board.map((square, index) => (
          <Button
            key={index}
            onClick={() => handleTicTacToeClick(index)}
            variant="outline"
            className="w-20 h-20 text-2xl font-bold"
            disabled={!!square || !!calculateWinner(board)}
          >
            {square}
          </Button>
        ))}
      </div>
      {calculateWinner(board) && (
        <p className="text-center font-bold">Winner: {calculateWinner(board)}</p>
      )}
      <Button onClick={handleSubmit} className="w-full">Submit Game</Button>
      <Button 
        onClick={() => resetGame("tic-tac-toe")}
        variant="outline"
        className="w-full"
      >
        Reset Game
      </Button>
    </Card>
  );
};
