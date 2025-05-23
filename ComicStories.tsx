
import { useState, useRef, useEffect } from "react";
import { Book, Mic, MicOff, Star, Flag, Play, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type ComicSeries = {
  id: string;
  title: string;
  description: string;
  language: string;
  thumbnail: string;
  episodes: Episode[];
};

type Episode = {
  id: string;
  title: string;
  panels: Panel[];
};

type Panel = {
  id: string;
  image: string;
  character: string;
  dialogue: string;
  choices?: Choice[];
  isInteractive: boolean;
  nextPanelOptions?: {
    [key: string]: string;
  };
};

type Choice = {
  id: string;
  text: string;
  correct: boolean;
  feedback?: string;
  nextPanelId?: string;
};

type Task = {
  description: string;
  completed: boolean;
  xpReward: number;
};

const ComicSeries: ComicSeries[] = [
  {
    id: "lost-phone-paris",
    title: "Lost Phone in Paris",
    description: "Navigate through Paris to find your lost phone, practicing French phrases along the way.",
    language: "French",
    thumbnail: "https://placekitten.com/500/300", // Placeholder image
    episodes: [
      {
        id: "episode1",
        title: "The Metro Mystery",
        panels: [
          {
            id: "panel1",
            image: "https://placekitten.com/800/500", // Placeholder image
            character: "Narrator",
            dialogue: "You're visiting Paris and realize your phone is missing. The last place you remember having it was on the metro.",
            isInteractive: false,
          },
          {
            id: "panel2",
            image: "https://placekitten.com/800/501", // Placeholder image
            character: "You",
            dialogue: "You need to ask someone if they've seen your phone. How would you say this?",
            isInteractive: true,
            choices: [
              {
                id: "choice1",
                text: "Excusez-moi, avez-vous vu mon téléphone?",
                correct: true,
                feedback: "Perfect! That's exactly how to ask.",
                nextPanelId: "panel3",
              },
              {
                id: "choice2",
                text: "Où est mon téléphone?",
                correct: false,
                feedback: "This is too direct and might come across as rude.",
                nextPanelId: "panel4",
              },
              {
                id: "choice3",
                text: "Je cherche mon téléphone.",
                correct: false,
                feedback: "This states you're looking for your phone but doesn't ask if they've seen it.",
                nextPanelId: "panel4",
              },
            ],
          },
          {
            id: "panel3",
            image: "https://placekitten.com/800/502", // Placeholder image
            character: "Parisian",
            dialogue: "Non, désolé, je n'ai pas vu de téléphone. Peut-être au bureau des objets trouvés?",
            isInteractive: false,
          },
          {
            id: "panel4",
            image: "https://placekitten.com/800/503", // Placeholder image
            character: "Parisian",
            dialogue: "Je ne comprends pas bien. Vous avez perdu quelque chose?",
            isInteractive: true,
            choices: [
              {
                id: "choice1",
                text: "Oui, j'ai perdu mon téléphone dans le métro.",
                correct: true,
                feedback: "Good clarification!",
                nextPanelId: "panel3",
              },
              {
                id: "choice2",
                text: "Téléphone. Perdu.",
                correct: false,
                feedback: "Too basic, try forming a complete sentence.",
                nextPanelId: "panel5",
              },
            ],
          },
          {
            id: "panel5",
            image: "https://placekitten.com/800/504", // Placeholder image
            character: "Parisian",
            dialogue: "Maybe you should try speaking in full sentences. The lost and found office is that way.",
            isInteractive: false,
          },
        ],
      },
    ],
  },
  {
    id: "dating-in-tokyo",
    title: "Dating in Tokyo",
    description: "Navigate the complex etiquette of dating in Japan while learning useful Japanese phrases.",
    language: "Japanese",
    thumbnail: "https://placekitten.com/501/300", // Placeholder image
    episodes: [
      {
        id: "episode1",
        title: "First Date at a Cafe",
        panels: [
          {
            id: "panel1",
            image: "https://placekitten.com/800/505", // Placeholder image
            character: "Narrator",
            dialogue: "You're meeting someone for a first date at a Tokyo cafe. You arrive first and need to order while waiting.",
            isInteractive: false,
          },
          // More panels would be defined here
        ],
      },
    ],
  },
  {
    id: "street-food-mexico",
    title: "Ordering Street Food in Mexico",
    description: "Learn how to order authentic street food in Spanish and discover Mexican culinary culture.",
    language: "Spanish",
    thumbnail: "https://placekitten.com/502/300", // Placeholder image
    episodes: [
      {
        id: "episode1",
        title: "Taco Stand Adventure",
        panels: [
          {
            id: "panel1",
            image: "https://placekitten.com/800/506", // Placeholder image
            character: "Narrator",
            dialogue: "You've arrived at a popular taco stand in Mexico City. The menu is in Spanish and there's a line behind you.",
            isInteractive: false,
          },
          // More panels would be defined here
        ],
      },
    ],
  },
];

// Tasks that connect comic learning to real-world practice
const RealWorldTasks: Record<string, Task[]> = {
  "lost-phone-paris": [
    {
      description: "Go to a cafe and order in French using 'Je voudrais un café, s'il vous plaît.'",
      completed: false,
      xpReward: 50,
    },
    {
      description: "Use the phrase 'Je suis perdu' in a conversation with someone learning French.",
      completed: false,
      xpReward: 30,
    },
  ],
  "dating-in-tokyo": [
    {
      description: "Practice introducing yourself in Japanese to a friend.",
      completed: false,
      xpReward: 40,
    },
  ],
  "street-food-mexico": [
    {
      description: "Order food in Spanish at a Mexican restaurant or food truck.",
      completed: false,
      xpReward: 50,
    },
  ],
};

const ComicStories = () => {
  const { toast } = useToast();
  const [selectedSeries, setSelectedSeries] = useState<ComicSeries | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [progress, setProgress] = useState(0);
  const [completedTask, setCompletedTask] = useState<string | null>(null);
  const [taskReflection, setTaskReflection] = useState("");
  const [activeTab, setActiveTab] = useState("series");
  const [userXp, setUserXp] = useState(0);

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Calculate progress percentage
    if (selectedEpisode) {
      const progressPercentage = (currentPanelIndex / selectedEpisode.panels.length) * 100;
      setProgress(progressPercentage);
    }
  }, [currentPanelIndex, selectedEpisode]);

  const handleSeriesSelect = (series: ComicSeries) => {
    setSelectedSeries(series);
    setSelectedEpisode(series.episodes[0]);
    setCurrentPanelIndex(0);
    setActiveTab("episode");
  };

  const handleStartRecording = () => {
    if (!isRecording) {
      // Check if browser supports SpeechRecognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = false;
        speechRecognitionRef.current.interimResults = true;
        
        // Set language based on the selected comic series
        if (selectedSeries) {
          switch (selectedSeries.language) {
            case "French":
              speechRecognitionRef.current.lang = 'fr-FR';
              break;
            case "Japanese":
              speechRecognitionRef.current.lang = 'ja-JP';
              break;
            case "Spanish":
              speechRecognitionRef.current.lang = 'es-ES';
              break;
            default:
              speechRecognitionRef.current.lang = 'en-US';
          }
        }

        speechRecognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setUserResponse(transcript);
        };

        speechRecognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          toast({
            title: "Error",
            description: "There was a problem with speech recognition. Please try again.",
            variant: "destructive",
          });
        };

        speechRecognitionRef.current.onend = () => {
          setIsRecording(false);
        };

        speechRecognitionRef.current.start();
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Speak your response clearly.",
        });
      } else {
        toast({
          title: "Not supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        });
      }
    } else {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleChoiceSelection = (choice: Choice) => {
    // Compare user's spoken response with the choice texts
    if (userResponse.trim() === "") {
      toast({
        title: "No response detected",
        description: "Please speak your response or try recording again.",
      });
      return;
    }

    // Simple matching logic - could be enhanced with NLP for better matching
    const currentPanel = selectedEpisode?.panels[currentPanelIndex];
    const choices = currentPanel?.choices || [];
    
    const normalizedUserResponse = userResponse.toLowerCase().trim();
    const matchedChoice = choices.find(c => 
      normalizedUserResponse.includes(c.text.toLowerCase())
    );
    
    if (matchedChoice) {
      handleChoice(matchedChoice);
    } else {
      // If no exact match, select the chosen option
      handleChoice(choice);
    }
  };

  const handleChoice = (choice: Choice) => {
    if (choice.correct) {
      toast({
        title: "Correct!",
        description: choice.feedback || "Good job!",
        variant: "default",
      });
      // Award XP for correct answers
      setUserXp(prev => prev + 10);
    } else {
      toast({
        title: "Not quite right",
        description: choice.feedback || "Try again with different phrasing.",
        variant: "default",
      });
    }

    // Logic to handle panel navigation based on choice
    if (choice.nextPanelId) {
      const nextPanelIndex = selectedEpisode?.panels.findIndex(
        panel => panel.id === choice.nextPanelId
      );
      if (nextPanelIndex !== undefined && nextPanelIndex >= 0) {
        setCurrentPanelIndex(nextPanelIndex);
      }
    } else {
      // Move to the next panel if no specific next panel is defined
      moveToNextPanel();
    }

    // Reset user response
    setUserResponse("");
  };

  const moveToNextPanel = () => {
    if (selectedEpisode) {
      if (currentPanelIndex < selectedEpisode.panels.length - 1) {
        setCurrentPanelIndex(currentPanelIndex + 1);
      } else {
        // End of episode
        completeEpisode();
      }
    }
  };

  const completeEpisode = () => {
    toast({
      title: "Episode completed!",
      description: "Great job! You've completed this episode.",
    });
    
    // Award XP for episode completion
    setUserXp(prev => prev + 50);
    
    // Show real-world tasks
    setActiveTab("tasks");
  };

  const completeTask = (taskDescription: string, xpReward: number) => {
    setCompletedTask(taskDescription);
    // Show reflection input
    setActiveTab("reflection");
  };

  const submitReflection = () => {
    if (taskReflection.trim() === "") {
      toast({
        title: "Empty reflection",
        description: "Please share your experience with the task.",
      });
      return;
    }

    // Find and complete the task
    if (selectedSeries && completedTask) {
      const tasks = RealWorldTasks[selectedSeries.id];
      const taskIndex = tasks.findIndex(t => t.description === completedTask);
      
      if (taskIndex >= 0) {
        // Award XP for task completion
        setUserXp(prev => prev + tasks[taskIndex].xpReward);
        
        toast({
          title: "Task completed!",
          description: `You earned ${tasks[taskIndex].xpReward} XP! Great job applying your learning.`,
        });
      }
    }
    
    // Reset and go back to series selection
    setTaskReflection("");
    setCompletedTask(null);
    setActiveTab("series");
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Language Comic Stories</h1>
          <p className="text-muted-foreground">Learn languages through interactive comic adventures</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">{userXp} XP</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="series">Comic Series</TabsTrigger>
          <TabsTrigger value="episode" disabled={!selectedEpisode}>Episode</TabsTrigger>
          <TabsTrigger value="tasks" disabled={!selectedSeries}>Real-World Tasks</TabsTrigger>
          <TabsTrigger value="reflection" disabled={!completedTask}>Reflection</TabsTrigger>
        </TabsList>

        {/* Comic Series Selection */}
        <TabsContent value="series" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ComicSeries.map((series) => (
              <Card 
                key={series.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSeriesSelect(series)}
              >
                <img 
                  src={series.thumbnail} 
                  alt={series.title} 
                  className="w-full h-40 object-cover"
                />
                <CardHeader className="pb-2">
                  <CardTitle>{series.title}</CardTitle>
                  <CardDescription>{series.language}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{series.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Episode Reading & Interaction */}
        <TabsContent value="episode" className="space-y-6">
          {selectedEpisode && selectedSeries && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedEpisode.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedSeries.title} • {selectedSeries.language}</p>
                </div>
                <Progress value={progress} className="w-1/3" />
              </div>

              <Card className="overflow-hidden">
                {selectedEpisode.panels[currentPanelIndex] && (
                  <>
                    <img 
                      src={selectedEpisode.panels[currentPanelIndex].image} 
                      alt="Comic panel" 
                      className="w-full h-64 object-cover"
                    />
                    <CardContent className="space-y-4 pt-6">
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <div className="font-medium mb-2">{selectedEpisode.panels[currentPanelIndex].character}:</div>
                        <p>{selectedEpisode.panels[currentPanelIndex].dialogue}</p>
                      </div>

                      {/* Interactive choices section */}
                      {selectedEpisode.panels[currentPanelIndex].isInteractive && selectedEpisode.panels[currentPanelIndex].choices && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Your response:</h3>
                              <div className="h-8 text-sm text-muted-foreground">
                                {userResponse ? userResponse : "Record your voice to respond..."}
                              </div>
                            </div>
                            <Button 
                              onClick={handleStartRecording}
                              variant={isRecording ? "destructive" : "outline"}
                              className="flex items-center gap-2"
                            >
                              {isRecording ? (
                                <>
                                  <MicOff className="h-4 w-4" /> Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="h-4 w-4" /> Record Response
                                </>
                              )}
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Choose one option to speak:</h3>
                            <div className="grid grid-cols-1 gap-2">
                              {selectedEpisode.panels[currentPanelIndex].choices.map((choice) => (
                                <div 
                                  key={choice.id} 
                                  className="border rounded-lg p-3 hover:bg-primary/5 cursor-pointer flex justify-between items-center"
                                  onClick={() => handleChoiceSelection(choice)}
                                >
                                  <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-primary" />
                                    <span>{choice.text}</span>
                                  </div>
                                  <Play className="h-4 w-4 text-muted-foreground" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Non-interactive panel navigation */}
                      {!selectedEpisode.panels[currentPanelIndex].isInteractive && (
                        <div className="flex justify-end">
                          <Button onClick={moveToNextPanel}>
                            Continue
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>
            </>
          )}
        </TabsContent>

        {/* Real-World Tasks */}
        <TabsContent value="tasks" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Real-World Connection Tasks</h2>
            <p className="text-muted-foreground">Apply what you've learned in real situations</p>
          </div>

          {selectedSeries && RealWorldTasks[selectedSeries.id] && (
            <div className="space-y-4">
              {RealWorldTasks[selectedSeries.id].map((task, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flag className="h-5 w-5 text-primary" />
                      Live Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{task.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Reward: {task.xpReward} XP</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => completeTask(task.description, task.xpReward)}>
                      I've Completed This Task
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reflection */}
        <TabsContent value="reflection" className="space-y-4">
          <h2 className="text-2xl font-semibold">Task Reflection</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How did your task go?</CardTitle>
              <CardDescription>
                {completedTask}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="reflection">Share your experience</Label>
                  <textarea
                    id="reflection"
                    placeholder="What happened? How did it feel using the language in real life?"
                    className="w-full h-32 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    value={taskReflection}
                    onChange={(e) => setTaskReflection(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={submitReflection}>Submit Reflection</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComicStories;
