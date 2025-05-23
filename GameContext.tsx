import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

interface GameContextType {
  wordToGuess: string;
  guessedLetters: string[];
  board: (string | null)[];
  isXNext: boolean;
  diceNumber: number;
  diceRolls: number;
  ticTacToeWins: number;
  magicSquare: number[];
  targetSum: number;
  timer: number;
  isTimerRunning: boolean;
  bestTime: number;
  xpPoints: number;
  selectedGame: string | null;
  setSelectedGame: (gameId: string) => void;
  handleWordGuess: (letter: string) => void;
  handleTicTacToeClick: (index: number) => void;
  rollDice: () => void;
  handleMagicSquareInput: (index: number, value: string) => void;
  handleMagicSquareComplete: () => void;
  resetGame: (gameId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [wordToGuess, setWordToGuess] = useState("ELEPHANT");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [diceNumber, setDiceNumber] = useState(1);
  const [diceRolls, setDiceRolls] = useState(0);
  const [ticTacToeWins, setTicTacToeWins] = useState(0);
  const [magicSquare, setMagicSquare] = useState(Array(9).fill(0));
  const [targetSum] = useState(15);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bestTime, setBestTime] = useState(Infinity);
  const [xpPoints, setXpPoints] = useState(0);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

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

  const handleWordGuess = (letter: string) => {
    if (!guessedLetters.includes(letter)) {
      const newGuessedLetters = [...guessedLetters, letter];
      setGuessedLetters(newGuessedLetters);
      
      const allLettersGuessed = wordToGuess.split('').every(l => newGuessedLetters.includes(l));
      if (allLettersGuessed) {
        toast.success(`Congratulations! You solved it!`);
      }
    }
  };

  const handleTicTacToeClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    
    const winner = calculateWinner(newBoard);
    if (winner === 'X') {
      setTicTacToeWins(prev => prev + 1);
      toast.success(`You won!`);
    }
  };

  const rollDice = () => {
    const newNumber = Math.floor(Math.random() * 6) + 1;
    setDiceNumber(newNumber);
    setDiceRolls(prev => prev + 1);
  };

  const handleMagicSquareInput = (index: number, value: string) => {
    const newValue = parseInt(value) || 0;
    if (newValue >= 0 && newValue <= 9) {
      const newSquare = [...magicSquare];
      newSquare[index] = newValue;
      setMagicSquare(newSquare);
      
      if (!isTimerRunning) {
        setIsTimerRunning(true);
        setTimer(0);
      }
    }
  };

  const checkMagicSquare = () => {
    const sums = [
      magicSquare.slice(0, 3).reduce((a, b) => a + b, 0),
      magicSquare.slice(3, 6).reduce((a, b) => a + b, 0),
      magicSquare.slice(6, 9).reduce((a, b) => a + b, 0),
      magicSquare[0] + magicSquare[3] + magicSquare[6],
      magicSquare[1] + magicSquare[4] + magicSquare[7],
      magicSquare[2] + magicSquare[5] + magicSquare[8],
      magicSquare[0] + magicSquare[4] + magicSquare[8],
      magicSquare[2] + magicSquare[4] + magicSquare[6]
    ];
    return sums.every(sum => sum === targetSum);
  };

  const handleMagicSquareComplete = () => {
    if (checkMagicSquare()) {
      setIsTimerRunning(false);
      const timeBonus = Math.max(100 - timer, 0);
      const newXp = timeBonus + 100;
      setXpPoints(prev => prev + newXp);
      
      if (timer < bestTime) {
        setBestTime(timer);
        toast.success(`New Best Time: ${timer} seconds! +${newXp} XP`);
      } else {
        toast.success(`Completed in ${timer} seconds! +${newXp} XP`);
      }
    }
  };

  const resetGame = (gameId: string) => {
    switch (gameId) {
      case "word-puzzle":
        setGuessedLetters([]);
        break;
      case "tic-tac-toe":
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        break;
      case "magic-square":
        setMagicSquare(Array(9).fill(0));
        setTimer(0);
        setIsTimerRunning(false);
        break;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    // Start timer when a game starts
    if (selectedGame) {
      setIsTimerRunning(true);
      setTimer(0);
    } else {
      setIsTimerRunning(false);
    }
  }, [selectedGame]);

  return (
    <GameContext.Provider value={{
      wordToGuess,
      guessedLetters,
      board,
      isXNext,
      diceNumber,
      diceRolls,
      ticTacToeWins,
      magicSquare,
      targetSum,
      timer,
      isTimerRunning,
      bestTime,
      xpPoints,
      selectedGame,
      setSelectedGame,
      handleWordGuess,
      handleTicTacToeClick,
      rollDice,
      handleMagicSquareInput,
      handleMagicSquareComplete,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
