
import { MessageCircle, X, Image, Mic, Smile, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'system', timestamp: Date}>>([
    {text: "Welcome to LinguaLearner! How can I help you today?", sender: 'system', timestamp: new Date()}
  ]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        toast({
          title: "Image selected",
          description: `Selected image: ${file.name}`,
        });
        addMessage(`[Image: ${file.name}]`, 'user');
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleVoiceRecord = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log('Voice data:', event.data);
            addMessage("[Voice message]", 'user');
          }
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Recording your voice message...",
        });
      } else {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
          toast({
            title: "Recording stopped",
            description: "Voice message recorded",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const addMessage = (text: string, sender: 'user' | 'system') => {
    setMessages(prev => [...prev, {
      text,
      sender,
      timestamp: new Date()
    }]);
  };

  const handleSubmit = () => {
    if (message.trim()) {
      addMessage(message, 'user');
      setTimeout(() => {
        addMessage("I received your message. This is a demo chat interface.", 'system');
      }, 1000);
      setMessage("");
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-20 right-8 z-50">
      {isOpen ? (
        <Card className="w-80 sm:w-96 h-[500px] p-4 flex flex-col shadow-lg border-primary/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-primary">Chat Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto mb-4 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-3 p-3 rounded-lg max-w-[85%] ${
                  msg.sender === 'user' 
                    ? 'ml-auto bg-primary text-white' 
                    : 'mr-auto bg-gray-100 dark:bg-gray-800'
                } shadow-sm`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-[10px] opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image"
                className="rounded-full h-8 w-8 p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleVoiceRecord}
                className={`rounded-full h-8 w-8 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${isRecording ? "text-red-500" : ""}`}
                title={isRecording ? "Stop recording" : "Record voice"}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title="Add emoji"
                    className="rounded-full h-8 w-8 p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" side="top">
                  <Picker 
                    data={data} 
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type a message..."
                  className="resize-none h-10 py-2 px-3 border-gray-200 dark:border-gray-700 focus:border-primary"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSubmit}
                title="Send message"
                className="rounded-full h-8 w-8 p-1 bg-primary text-white hover:bg-primary/80"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/80"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
