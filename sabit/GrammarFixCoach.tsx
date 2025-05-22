
import { useState } from "react";
import { Edit, Mic, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GrammarIssue {
  original: string;
  corrected: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

const GrammarFixCoach = () => {
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);

  // Grammar analysis - in a real app, this would call an API
  const analyzeGrammar = () => {
    if (!userInput.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    // This is a simplified implementation
    // In a real app, you would call a grammar checking API
    const mockIssues: GrammarIssue[] = [];
    
    // Check for common mistakes (simplified examples)
    if (userInput.toLowerCase().includes("i is")) {
      mockIssues.push({
        original: "I is",
        corrected: "I am",
        explanation: "Use 'am' instead of 'is' with the pronoun 'I'",
        startIndex: userInput.toLowerCase().indexOf("i is"),
        endIndex: userInput.toLowerCase().indexOf("i is") + 4
      });
    }
    
    if (userInput.toLowerCase().includes("they is")) {
      mockIssues.push({
        original: "They is",
        corrected: "They are",
        explanation: "Use 'are' instead of 'is' with plural pronouns like 'they'",
        startIndex: userInput.toLowerCase().indexOf("they is"),
        endIndex: userInput.toLowerCase().indexOf("they is") + 7
      });
    }
    
    if (userInput.toLowerCase().includes("i have eat")) {
      mockIssues.push({
        original: "have eat",
        corrected: "have eaten",
        explanation: "After 'have', use the past participle form of the verb ('eaten' instead of 'eat')",
        startIndex: userInput.toLowerCase().indexOf("have eat"),
        endIndex: userInput.toLowerCase().indexOf("have eat") + 8
      });
    }
    
    if (userInput.toLowerCase().includes("yesterday i go")) {
      mockIssues.push({
        original: "yesterday I go",
        corrected: "yesterday I went",
        explanation: "Use past tense with past time expressions like 'yesterday'",
        startIndex: userInput.toLowerCase().indexOf("yesterday i go"),
        endIndex: userInput.toLowerCase().indexOf("yesterday i go") + 13
      });
    }

    // If no grammar issues found with our simple checks
    if (mockIssues.length === 0) {
      toast.success("No grammar issues found!");
    } else {
      toast.success(`Found ${mockIssues.length} grammar ${mockIssues.length === 1 ? 'issue' : 'issues'}`);
    }
    
    setGrammarIssues(mockIssues);
  };

  // Speech recognition functionality
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // @ts-ignore - SpeechRecognition is not in the TypeScript types
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserInput(prev => prev + ' ' + transcript);
          setIsRecording(false);
        };
        
        recognition.onerror = () => {
          toast.error("Speech recognition error occurred");
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
        setIsRecording(true);
        toast.info("Listening...");
      } else {
        toast.error("Speech recognition is not supported in this browser");
      }
    } else {
      // Stop recording
      // @ts-ignore - SpeechRecognition is not in the TypeScript types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.stop();
      setIsRecording(false);
    }
  };

  // Highlight text with grammar issues
  const highlightedText = () => {
    if (grammarIssues.length === 0) return userInput;
    
    // Sort issues by their start index to process them in order
    const sortedIssues = [...grammarIssues].sort((a, b) => a.startIndex - b.startIndex);
    
    let result = [];
    let lastIndex = 0;
    
    for (const issue of sortedIssues) {
      // Add text before the issue
      if (issue.startIndex > lastIndex) {
        result.push(userInput.substring(lastIndex, issue.startIndex));
      }
      
      // Add highlighted issue
      result.push(
        <span key={issue.startIndex} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
          {userInput.substring(issue.startIndex, issue.endIndex)}
        </span>
      );
      
      lastIndex = issue.endIndex;
    }
    
    // Add remaining text
    if (lastIndex < userInput.length) {
      result.push(userInput.substring(lastIndex));
    }
    
    return result;
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Grammar Fix Coach</h2>
      
      <Card className="p-6">
        <div className="mb-4">
          <Textarea
            placeholder="Type or speak in English and get instant grammar feedback..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[120px] mb-2"
          />
          
          <div className="flex justify-between">
            <Button 
              onClick={analyzeGrammar} 
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" /> Analyze Grammar
            </Button>
            
            <Button 
              variant={isRecording ? "destructive" : "outline"} 
              onClick={toggleRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Voice Input
                </>
              )}
            </Button>
          </div>
        </div>
        
        {grammarIssues.length > 0 && (
          <>
            <div className="mb-4 border rounded-md p-4 bg-background">
              <h4 className="font-medium mb-2">Your text with highlights:</h4>
              <p className="text-sm">{highlightedText()}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Suggested Fixes:</h4>
              <div className="space-y-3">
                {grammarIssues.map((issue, index) => (
                  <div key={index} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                    <div className="flex gap-2 mb-1">
                      <span className="line-through text-muted-foreground">{issue.original}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{issue.corrected}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default GrammarFixCoach;
