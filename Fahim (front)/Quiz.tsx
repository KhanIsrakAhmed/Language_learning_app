
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const Quiz = () => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});

  const quizLevels = [
    {
      id: 1,
      title: "Level 1 (Basic)",
      description: "Test your mathematical knowledge",
      color: "bg-[#F2FCE2]",
      questions: [
        { id: "1-1", question: "What is 15 × 4?", options: ["45", "50", "60", "75"], answer: "60" },
        { id: "1-2", question: "Solve: 128 ÷ 8", options: ["14", "16", "18", "20"], answer: "16" },
        { id: "1-3", question: "What is 23 + 45?", options: ["58", "68", "78", "88"], answer: "68" },
        { id: "1-4", question: "Calculate 17 - 9", options: ["6", "7", "8", "9"], answer: "8" },
        { id: "1-5", question: "What is 7 × 8?", options: ["54", "56", "58", "60"], answer: "56" },
        { id: "1-6", question: "Solve: 81 ÷ 9", options: ["7", "8", "9", "10"], answer: "9" },
        { id: "1-7", question: "What is 34 + 28?", options: ["52", "62", "72", "82"], answer: "62" },
        { id: "1-8", question: "Calculate 45 - 17", options: ["25", "27", "28", "30"], answer: "28" },
        { id: "1-9", question: "What is 12 × 6?", options: ["62", "66", "70", "72"], answer: "72" },
        { id: "1-10", question: "Solve: 100 ÷ 5", options: ["15", "20", "25", "30"], answer: "20" }
      ]
    },
    {
      id: 2,
      title: "Level 2 (Standard)",
      description: "Test your geographical knowledge",
      color: "bg-[#FEF7CD]",
      questions: [
        { id: "2-1", question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: "Paris" },
        { id: "2-2", question: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific" },
        { id: "2-3", question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Mississippi", "Yangtze"], answer: "Nile" },
        { id: "2-4", question: "Which continent is the largest?", options: ["North America", "Africa", "Asia", "Europe"], answer: "Asia" },
        { id: "2-5", question: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], answer: "Tokyo" },
        { id: "2-6", question: "Which desert is the largest?", options: ["Gobi", "Sahara", "Arabian", "Antarctic"], answer: "Antarctic" },
        { id: "2-7", question: "What is the highest mountain?", options: ["K2", "Kilimanjaro", "Everest", "McKinley"], answer: "Everest" },
        { id: "2-8", question: "Which country has the most population?", options: ["India", "USA", "China", "Russia"], answer: "China" },
        { id: "2-9", question: "What is the capital of Brazil?", options: ["Rio", "Brasilia", "Sao Paulo", "Salvador"], answer: "Brasilia" },
        { id: "2-10", question: "Which is the smallest continent?", options: ["Europe", "Antarctica", "Australia", "Africa"], answer: "Australia" }
      ]
    },
    {
      id: 3,
      title: "Level 3 (Medium)",
      description: "Test your agricultural knowledge",
      color: "bg-[#FEC6A1]",
      questions: [
        { id: "3-1", question: "What crop is the leading source of flour?", options: ["Rice", "Wheat", "Corn", "Barley"], answer: "Wheat" },
        { id: "3-2", question: "Which season is best for planting wheat?", options: ["Spring", "Summer", "Fall", "Winter"], answer: "Fall" },
        { id: "3-3", question: "What is the process of removing water from crops?", options: ["Irrigation", "Drainage", "Flooding", "Sprinkling"], answer: "Drainage" },
        { id: "3-4", question: "Which soil is best for growing crops?", options: ["Sandy", "Clay", "Loam", "Silt"], answer: "Loam" },
        { id: "3-5", question: "What is the study of soil management called?", options: ["Agronomy", "Botany", "Geology", "Hydrology"], answer: "Agronomy" },
        { id: "3-6", question: "Which nutrient helps plants grow leaves?", options: ["Nitrogen", "Phosphorus", "Potassium", "Calcium"], answer: "Nitrogen" },
        { id: "3-7", question: "What is crop rotation?", options: ["Harvesting", "Planting different crops", "Watering", "Fertilizing"], answer: "Planting different crops" },
        { id: "3-8", question: "Which farming method preserves water?", options: ["Drip irrigation", "Flooding", "Spraying", "Rain"], answer: "Drip irrigation" },
        { id: "3-9", question: "What is vertical farming?", options: ["Underground", "Stacked layers", "Mountain", "Floating"], answer: "Stacked layers" },
        { id: "3-10", question: "Which tool is used for plowing?", options: ["Rake", "Hoe", "Tractor", "Shovel"], answer: "Tractor" }
      ]
    },
    {
      id: 4,
      title: "Level 4 (Hard)",
      description: "Test your space knowledge",
      color: "bg-[#D946EF]/10",
      questions: [
        { id: "4-1", question: "What is the largest planet in our solar system?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answer: "Jupiter" },
        { id: "4-2", question: "What is a light-year?", options: ["Speed of light", "Distance", "Time", "Energy"], answer: "Distance" },
        { id: "4-3", question: "What is a black hole?", options: ["Dead star", "Planet", "Galaxy", "Asteroid"], answer: "Dead star" },
        { id: "4-4", question: "Which galaxy contains Earth?", options: ["Andromeda", "Milky Way", "Triangulum", "Whirlpool"], answer: "Milky Way" },
        { id: "4-5", question: "What causes tides on Earth?", options: ["Sun", "Moon", "Wind", "Both Sun and Moon"], answer: "Both Sun and Moon" },
        { id: "4-6", question: "What is a nebula?", options: ["Star cluster", "Gas cloud", "Planet group", "Asteroid belt"], answer: "Gas cloud" },
        { id: "4-7", question: "What is the closest star to Earth?", options: ["Proxima Centauri", "Alpha Centauri", "Sun", "Sirius"], answer: "Sun" },
        { id: "4-8", question: "What is the study of the universe called?", options: ["Astronomy", "Astrology", "Cosmology", "Physics"], answer: "Cosmology" },
        { id: "4-9", question: "What is a pulsar?", options: ["Rotating star", "Planet", "Asteroid", "Comet"], answer: "Rotating star" },
        { id: "4-10", question: "What is the speed of light?", options: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"], answer: "299,792 km/s" }
      ]
    }
  ];

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = (levelId: number) => {
    const level = quizLevels.find(l => l.id === levelId);
    if (!level) return;

    let correctAnswers = 0;
    level.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.answer) {
        correctAnswers++;
      }
    });

    alert(`You got ${correctAnswers} out of 10 questions correct!`);
    setSelectedAnswers({});
    setSelectedLevel(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Quiz Section</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Test your knowledge</p>
      </div>
      
      {selectedLevel === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizLevels.map((level) => (
            <div
              key={level.id}
              className={`${level.color} rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 dark:bg-opacity-20`}
              onClick={() => setSelectedLevel(level.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {level.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {level.description}
                  </p>
                  <Button className="mt-4 w-full">Start Quiz</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {quizLevels.find(l => l.id === selectedLevel)?.title}
              </h2>
              <Button variant="outline" onClick={() => setSelectedLevel(null)}>
                Back to Levels
              </Button>
            </div>
            
            {quizLevels
              .find(l => l.id === selectedLevel)
              ?.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {index + 1}. {question.question}
                  </h3>
                  <RadioGroup
                    value={selectedAnswers[question.id]}
                    onValueChange={(value) => handleAnswerSelect(question.id, value)}
                  >
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            
            <Button
              className="w-full mt-6"
              onClick={() => handleSubmit(selectedLevel)}
            >
              Submit Quiz
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Quiz;
