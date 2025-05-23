import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Mic, Play, RefreshCw, Youtube, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type Language = "english" | "french" | "bangla";

interface DialogueLine {
  id: string;
  character: string;
  text: string;
  timestamp: string;
}

interface CustomClip {
  id: string;
  title: string;
  youtubeId: string;
  language: Language;
  dialogue: DialogueLine[];
}

const MovieDialogue = () => {
  const [customClips, setCustomClips] = useState<CustomClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<CustomClip | null>(null);
  const [currentLine, setCurrentLine] = useState<DialogueLine | null>(null);
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [userRecordings, setUserRecordings] = useState<Record<string, string>>({});
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now());
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [clipTitle, setClipTitle] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("english");
  const [newDialogue, setNewDialogue] = useState<DialogueLine[]>([]);
  const [newCharacter, setNewCharacter] = useState("");
  const [newText, setNewText] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("");
  
  const audioRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const addTabRef = useRef<HTMLButtonElement>(null);

  // Extract YouTube ID from URL
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Add new dialogue line
  const addDialogueLine = () => {
    if (!newCharacter || !newText) {
      toast.error("Character name and dialogue text are required");
      return;
    }

    const newLine = {
      id: Date.now().toString(),
      character: newCharacter,
      text: newText,
      timestamp: newTimestamp || "0:00"
    };

    setNewDialogue([...newDialogue, newLine]);
    setNewCharacter("");
    setNewText("");
    setNewTimestamp("");
    toast.success("Dialogue line added");
  };

  // Remove dialogue line
  const removeDialogueLine = (id: string) => {
    setNewDialogue(newDialogue.filter(line => line.id !== id));
  };

  // Add new clip
  const addNewClip = () => {
    if (!youtubeUrl || !clipTitle) {
      toast.error("YouTube URL and title are required");
      return;
    }

    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    if (newDialogue.length === 0) {
      toast.error("At least one dialogue line is required");
      return;
    }

    const newClip: CustomClip = {
      id: Date.now().toString(),
      title: clipTitle,
      youtubeId,
      language: selectedLanguage,
      dialogue: newDialogue
    };

    setCustomClips([...customClips, newClip]);
    setSelectedClip(newClip);
    setYoutubeUrl("");
    setClipTitle("");
    setNewDialogue([]);
    toast.success("New clip added");
    
    // Navigate back to content tab
    const contentTabTrigger = document.querySelector('[data-value="content"]') as HTMLElement;
    if (contentTabTrigger) {
      contentTabTrigger.click();
    }
  };

  // Remove clip
  const removeClip = (id: string) => {
    setCustomClips(customClips.filter(clip => clip.id !== id));
    if (selectedClip?.id === id) {
      setSelectedClip(null);
      setCurrentLine(null);
    }
  };

  const handleSelectClip = (clip: CustomClip) => {
    setSelectedClip(clip);
    setCurrentLine(null);
    setScore(null);
    setFeedback("");
    setIsVideoPlaying(false);
    setVideoKey(Date.now());
  };

  const handleStartPractice = () => {
    if (selectedClip && selectedClip.dialogue.length > 0) {
      setCurrentLine(selectedClip.dialogue[0]);
      setScore(null);
      setFeedback("");
    }
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
    setVideoKey(Date.now());
  };

  const handleRecordVoice = async () => {
    if (recording) {
      // Stop recording
      if (audioRef.current) {
        audioRef.current.stop();
      }
      return;
    }

    try {
      // Start recording
      setRecording(true);
      toast.info("Recording your voice...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Simulating pronunciation scoring logic
        const mockScore = Math.floor(Math.random() * 41) + 60; // Score between 60-100
        setScore(mockScore);
        
        // Store recording
        if (currentLine) {
          setUserRecordings({
            ...userRecordings,
            [currentLine.id]: audioUrl
          });
        }
        
        // Generate feedback based on score
        if (mockScore >= 90) {
          setFeedback("Excellent pronunciation! Your accent sounds natural.");
        } else if (mockScore >= 80) {
          setFeedback("Great job! Try to work on your intonation a bit more.");
        } else if (mockScore >= 70) {
          setFeedback("Good effort! Try slowing down and emphasizing key syllables.");
        } else {
          setFeedback("Keep practicing! Focus on the vowel sounds and rhythm.");
        }
        
        setRecording(false);
        toast.success("Recording analyzed!");
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      
      // Automatically stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecording(false);
      toast.error("Could not access your microphone. Please check permissions.");
    }
  };

  const handleNextLine = () => {
    if (selectedClip && currentLine) {
      const currentIndex = selectedClip.dialogue.findIndex(line => line.id === currentLine.id);
      if (currentIndex < selectedClip.dialogue.length - 1) {
        setCurrentLine(selectedClip.dialogue[currentIndex + 1]);
        setScore(null);
        setFeedback("");
      } else {
        toast.success("You've completed all lines in this clip!");
        setCurrentLine(null);
      }
    }
  };

  const handlePlayDubbed = () => {
    // In a real app, this would play the video with the user's dubbed voice
    toast.success("Playing your dubbed video!");
    // Simulation of playing video with user recordings
    setTimeout(() => {
      toast.success("Dubbing complete! Great work!");
    }, 3000);
  };

  const handleAddNewClip = () => {
    const addTabTrigger = document.querySelector('[data-value="add"]') as HTMLElement;
    if (addTabTrigger) {
      addTabTrigger.click();
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center gap-4">
        <Film className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movie Dialogue Practice</h1>
          <p className="text-muted-foreground">
            Learn languages through custom YouTube videos
          </p>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">My Clips</TabsTrigger>
          <TabsTrigger value="add">Add New Clip</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          {customClips.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Youtube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No clips added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first YouTube clip to start practicing dialogue
                </p>
                <Button onClick={handleAddNewClip}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Clip
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Clips</h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {customClips.map((clip) => (
                    <Card 
                      key={clip.id} 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedClip?.id === clip.id ? "ring-2 ring-primary" : ""
                      )}
                      onClick={() => handleSelectClip(clip)}
                    >
                      <CardContent className="p-4 flex gap-4">
                        <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={`https://i.ytimg.com/vi/${clip.youtubeId}/hqdefault.jpg`}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if thumbnail fails to load
                              (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/shapes/svg?seed=" + clip.id;
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">{clip.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeClip(clip.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Language: {clip.language.charAt(0).toUpperCase() + clip.language.slice(1)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {clip.dialogue.length} dialogue lines
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                {selectedClip && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedClip.title}</CardTitle>
                      <CardDescription>
                        Language: {selectedClip.language.charAt(0).toUpperCase() + selectedClip.language.slice(1)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-md mb-4">
                        {isVideoPlaying ? (
                          <div className="relative w-full h-0 pb-[56.25%]">
                            <iframe 
                              key={videoKey}
                              src={`https://www.youtube.com/embed/${selectedClip.youtubeId}?autoplay=1&enablejsapi=1`} 
                              title={selectedClip.title}
                              className="absolute top-0 left-0 w-full h-full rounded-md"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center cursor-pointer relative"
                            onClick={handlePlayVideo}
                          >
                            <div className="aspect-video w-full">
                              <img 
                                src={`https://i.ytimg.com/vi/${selectedClip.youtubeId}/hqdefault.jpg`}
                                alt={selectedClip.title}
                                className="w-full h-full object-cover absolute inset-0 rounded-md"
                                onError={(e) => {
                                  // Fallback if thumbnail fails to load
                                  (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/shapes/svg?seed=" + selectedClip.id;
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                              <Youtube className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This clip contains {selectedClip.dialogue.length} lines of dialogue for practice.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleStartPractice} disabled={isVideoPlaying}>
                        Practice This Clip
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          )}

          {currentLine && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Practice Dialogue</CardTitle>
                <CardDescription>
                  Character: <span className="font-medium">{currentLine.character}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({currentLine.timestamp})
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dialogue</label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-lg">{currentLine.text}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button 
                    onClick={handleRecordVoice} 
                    disabled={false}
                    className="w-full"
                    variant={recording ? "outline" : "destructive"}
                  >
                    {recording ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Recording... (tap to stop)
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Record Your Voice
                      </>
                    )}
                  </Button>
                  
                  {score !== null && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pronunciation Score:</span>
                        <span className="text-xl font-bold">{score}/100</span>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{feedback}</p>
                      </div>
                      {userRecordings[currentLine.id] && (
                        <div className="p-3 bg-muted rounded-md">
                          <audio 
                            src={userRecordings[currentLine.id]} 
                            controls 
                            className="w-full"
                          />
                        </div>
                      )}
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={handleRecordVoice}>
                          Try Again
                        </Button>
                        <Button onClick={handleNextLine}>
                          Next Line
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!currentLine && Object.keys(userRecordings).length > 0 && selectedClip && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Clip Complete!</CardTitle>
                <CardDescription>
                  You've recorded {Object.keys(userRecordings).length} lines from this clip
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Now you can play back the clip with your voice dubbed in!</p>
                <Button onClick={handlePlayDubbed}>
                  <Play className="mr-2 h-4 w-4" />
                  Play Dubbed Clip
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New YouTube Clip</CardTitle>
              <CardDescription>
                Add your own YouTube video to practice dialogue in different languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="youtube-url" className="text-sm font-medium">YouTube URL</label>
                  <Input 
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste the full YouTube URL of the video you want to practice with
                  </p>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="clip-title" className="text-sm font-medium">Clip Title</label>
                  <Input 
                    id="clip-title"
                    placeholder="Give your clip a title..."
                    value={clipTitle}
                    onChange={(e) => setClipTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="language" className="text-sm font-medium">Language</label>
                  <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="bangla">Bangla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Add Dialogue Lines</h3>
                
                <div className="space-y-4 border p-4 rounded-md">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Character Name</label>
                    <Input 
                      placeholder="Character name..."
                      value={newCharacter}
                      onChange={(e) => setNewCharacter(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Dialogue Text</label>
                    <Textarea 
                      placeholder="Enter dialogue text..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Timestamp (optional)</label>
                    <Input 
                      placeholder="e.g., 1:24"
                      value={newTimestamp}
                      onChange={(e) => setNewTimestamp(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: minutes:seconds (e.g., 1:24)
                    </p>
                  </div>
                  
                  <Button onClick={addDialogueLine} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Line
                  </Button>
                </div>

                {newDialogue.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Added Dialogue Lines:</h4>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {newDialogue.map((line, index) => (
                        <div key={line.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <div className="flex-grow">
                            <p className="font-medium">{line.character} {line.timestamp && `(${line.timestamp})`}</p>
                            <p className="text-sm">{line.text}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeDialogueLine(line.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={addNewClip} disabled={!youtubeUrl || !clipTitle || newDialogue.length === 0}>
                <Plus className="mr-2 h-4 w-4" /> Create Clip
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MovieDialogue;
