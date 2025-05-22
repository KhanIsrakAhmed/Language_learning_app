import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase, dictionaryAPI } from "@/integrations/supabase/client";

interface Translation {
  language: string;
  translation: string;
  pronunciation?: string | null;
}

interface SearchResult {
  word: string;
  imageUrl: string | null;
  translations: Translation[];
}

interface Language {
  code: string;
  name: string;
  flag: string;
  country: string;
  langCode: string;
}

const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch some sample words for autocomplete suggestions
    const fetchSampleWords = async () => {
      try {
        const data = await dictionaryAPI.listWords('en', 20);
        setAvailableWords(data.map(item => item.word));
      } catch (error) {
        console.error('Error fetching sample words:', error);
      }
    };
    
    fetchSampleWords();
    
    const uploadImage = async () => {
      try {
        // Check for car image
        const carImage = await dictionaryAPI.getWordImage('car');
        
        if (carImage) {
          console.log("Car image already exists:", carImage);
          return;
        }
        
        setIsUploading(true);
        
        const imageUrl = document.querySelector('img[alt="car"]')?.getAttribute('src');
        
        if (!imageUrl) {
          console.error('Car image not found');
          return;
        }
        
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            const result = await fetch('https://kgeabazzragukkvlslzw.supabase.co/functions/v1/upload-car-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: reader.result,
                word: 'car'
              })
            });
            
            const data = await result.json();
            
            if (data.success) {
              // Update all language entries for 'car' with the image URL
              await dictionaryAPI.updateWordImage('car', data.imageUrl);
              toast.success('Car image has been added to dictionary');
            } else {
              console.error('Error uploading image:', data.error);
            }
          } catch (error) {
            console.error('Error in image upload:', error);
          } finally {
            setIsUploading(false);
          }
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error checking for car image:', error);
        setIsUploading(false);
      }
    };
    
    uploadImage();
  }, []);

  const languages: Language[] = [
    { code: "bn", name: "Bangla", flag: "🇧🇩", country: "Bangladesh", langCode: "bn-BD" },
    { code: "ar", name: "Arabic", flag: "🇸🇦", country: "Saudi Arabia", langCode: "ar-SA" },
    { code: "en", name: "English", flag: "🇬🇧", country: "England", langCode: "en-GB" },
    { code: "de", name: "German", flag: "🇩🇪", country: "Germany", langCode: "de-DE" },
    { code: "es", name: "Spanish", flag: "🇪🇸", country: "Spain", langCode: "es-ES" },
    { code: "pt", name: "Portuguese", flag: "🇧🇷", country: "Brazil", langCode: "pt-BR" },
    { code: "zh", name: "Chinese", flag: "🇨🇳", country: "China", langCode: "zh-CN" },
    { code: "ja", name: "Japanese", flag: "🇯🇵", country: "Japan", langCode: "ja-JP" },
    { code: "ko", name: "Korean", flag: "🇰🇷", country: "South Korea", langCode: "ko-KR" },
    { code: "hi", name: "Hindi", flag: "🇮🇳", country: "India", langCode: "hi-IN" },
    { code: "fr", name: "French", flag: "🇫🇷", country: "France", langCode: "fr-FR" },
  ];

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      }
      if (prev.length >= 4) {
        toast.error("You can only select up to 4 languages");
        return prev;
      }
      return [...prev, code];
    });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a word to search");
      return;
    }

    if (selectedLanguages.length === 0) {
      toast.error("Please select at least one language");
      return;
    }

    setIsLoading(true);

    try {
      // Get translations for selected languages using our helper method
      const translationsData = await dictionaryAPI.getTranslation(searchTerm.toLowerCase().trim(), selectedLanguages);
      
      // Find image URL from any translation that has one
      const imageUrl = translationsData.find(t => t.image_url)?.image_url || null;
      
      const translations = selectedLanguages.map(code => {
        const language = languages.find(l => l.code === code);
        const foundTranslation = translationsData?.find(t => t.language_code === code);
        
        return {
          language: language?.name || code,
          translation: foundTranslation?.translation || 
            `Translation not found for "${searchTerm}" in ${language?.name}`,
          pronunciation: foundTranslation?.pronunciation || null
        };
      });

      setResult({
        word: searchTerm,
        imageUrl: imageUrl,
        translations
      });
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Error fetching results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePronunciation = (text: string, langCode: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (langCode === "bn-BD") {
        const voices = window.speechSynthesis.getVoices();
        const bengaliVoice = voices.find(voice => 
          voice.lang.startsWith('bn') || 
          voice.lang === 'hi-IN'
        );
        
        if (bengaliVoice) {
          utterance.voice = bengaliVoice;
        }
        utterance.lang = 'bn-BD';
      } else {
        utterance.lang = langCode;
      }

      utterance.pitch = 1;
      utterance.rate = 0.9;

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Pronunciation error:', error);
      toast.error("Speech synthesis not supported in your browser");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Dictionary</h1>
        <p className="text-xl text-gray-600">
          Search for words and discover their meanings in multiple languages
        </p>
      </div>

      <img 
        src="data:image/jpeg;base64,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..." 
        alt="car"
        style={{ display: 'none' }}
      />

      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center space-x-2 p-2 border rounded-lg"
            >
              <Checkbox
                id={lang.code}
                checked={selectedLanguages.includes(lang.code)}
                onCheckedChange={() => handleLanguageToggle(lang.code)}
              />
              <label
                htmlFor={lang.code}
                className="text-sm flex items-center space-x-2 cursor-pointer"
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-gray-500">{lang.country}</span>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <Input
              placeholder="Search for a word..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              list="word-suggestions"
            />
            <Button onClick={handleSearch} disabled={isLoading || isUploading}>
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          
          {availableWords.length > 0 && (
            <datalist id="word-suggestions">
              {availableWords.map(word => (
                <option key={word} value={word} />
              ))}
            </datalist>
          )}
          
          <div className="text-sm text-gray-500 mt-1">
            Try searching: car, house, apple, fruit, tree, etc. (100+ words available)
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Results for "{result.word}"
            </h2>
            
            {result.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={result.imageUrl}
                  alt={result.word}
                  className="w-full h-[300px] object-cover"
                />
              </div>
            )}

            <div className="grid gap-4 mt-6">
              {result.translations.map((translation) => {
                const lang = languages.find(l => l.name === translation.language);
                return (
                  <div
                    key={translation.language}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">
                        {translation.language}:
                      </h3>
                      {lang && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePronunciation(translation.translation, lang.langCode)}
                          className="ml-2"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-600">{translation.translation}</p>
                    {translation.pronunciation && (
                      <p className="text-xs text-gray-500 mt-1">Pronunciation: {translation.pronunciation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dictionary;
