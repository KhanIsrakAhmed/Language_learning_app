
import { useState, useEffect, useRef } from "react";
import { Camera, Volume2, Upload, Loader2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CameraCapture from "@/components/CameraCapture";
import { dataURLtoFile, resizeImage } from "@/utils/imageUtils";
import { uploadImage } from "@/utils/supabaseStorage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const languageCodes = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "bn", name: "Bengali", flag: "🇧🇩" }, // Adding Bangladesh (Bengali language)
];

interface TranslationItem {
  word: string;
  translation: string;
  pronunciation: string;
  language_code: string;
}

interface Scenario {
  id: string;
  title: string;
  image: string;
  vocabulary: TranslationItem[];
}

// Define default translations for different languages and scenarios
const defaultTranslations = {
  fr: {
    restaurant: [
      { word: "table", translation: "la table", pronunciation: "lah tahbl" },
      { word: "menu", translation: "le menu", pronunciation: "luh men-u" },
      { word: "water", translation: "l'eau", pronunciation: "lo" },
      { word: "coffee", translation: "le café", pronunciation: "luh ka-fay" },
    ],
    airport: [
      { word: "flight", translation: "le vol", pronunciation: "luh vohl" },
      { word: "passport", translation: "le passeport", pronunciation: "luh pass-por" },
      { word: "luggage", translation: "les bagages", pronunciation: "lay bah-gazh" },
      { word: "gate", translation: "la porte", pronunciation: "lah port" },
    ],
    grocery: [
      { word: "fruit", translation: "le fruit", pronunciation: "luh frwee" },
      { word: "bread", translation: "le pain", pronunciation: "luh pan" },
      { word: "milk", translation: "le lait", pronunciation: "luh lay" },
      { word: "vegetables", translation: "les légumes", pronunciation: "lay lay-gum" },
    ],
  },
  es: {
    restaurant: [
      { word: "table", translation: "la mesa", pronunciation: "lah meh-sah" },
      { word: "menu", translation: "el menú", pronunciation: "el meh-noo" },
      { word: "water", translation: "el agua", pronunciation: "el ah-gwah" },
      { word: "coffee", translation: "el café", pronunciation: "el kah-feh" },
    ],
    airport: [
      { word: "flight", translation: "el vuelo", pronunciation: "el vweh-loh" },
      { word: "passport", translation: "el pasaporte", pronunciation: "el pah-sah-por-teh" },
      { word: "luggage", translation: "el equipaje", pronunciation: "el eh-kee-pah-heh" },
      { word: "gate", translation: "la puerta", pronunciation: "lah pwehr-tah" },
    ],
    grocery: [
      { word: "fruit", translation: "la fruta", pronunciation: "lah froo-tah" },
      { word: "bread", translation: "el pan", pronunciation: "el pahn" },
      { word: "milk", translation: "la leche", pronunciation: "lah leh-cheh" },
      { word: "vegetables", translation: "las verduras", pronunciation: "lahs vehr-doo-rahs" },
    ],
  },
  de: {
    restaurant: [
      { word: "table", translation: "der Tisch", pronunciation: "dehr tish" },
      { word: "menu", translation: "die Speisekarte", pronunciation: "dee shpy-zuh-kar-tuh" },
      { word: "water", translation: "das Wasser", pronunciation: "dahs vah-ser" },
      { word: "coffee", translation: "der Kaffee", pronunciation: "dehr kah-feh" },
    ],
    airport: [
      { word: "flight", translation: "der Flug", pronunciation: "dehr floog" },
      { word: "passport", translation: "der Reisepass", pronunciation: "dehr ry-zuh-pahs" },
      { word: "luggage", translation: "das Gepäck", pronunciation: "dahs guh-pek" },
      { word: "gate", translation: "das Gate", pronunciation: "dahs geyt" },
    ],
    grocery: [
      { word: "fruit", translation: "das Obst", pronunciation: "dahs ohpst" },
      { word: "bread", translation: "das Brot", pronunciation: "dahs broht" },
      { word: "milk", translation: "die Milch", pronunciation: "dee milh" },
      { word: "vegetables", translation: "das Gemüse", pronunciation: "dahs guh-moo-zuh" },
    ],
  },
  it: {
    restaurant: [
      { word: "table", translation: "il tavolo", pronunciation: "eel tah-voh-loh" },
      { word: "menu", translation: "il menu", pronunciation: "eel meh-noo" },
      { word: "water", translation: "l'acqua", pronunciation: "lahk-wah" },
      { word: "coffee", translation: "il caffè", pronunciation: "eel kaf-feh" },
    ],
    airport: [
      { word: "flight", translation: "il volo", pronunciation: "eel voh-loh" },
      { word: "passport", translation: "il passaporto", pronunciation: "eel pah-sah-por-toh" },
      { word: "luggage", translation: "il bagaglio", pronunciation: "eel bah-gah-lyoh" },
      { word: "gate", translation: "il gate", pronunciation: "eel geyt" },
    ],
    grocery: [
      { word: "fruit", translation: "la frutta", pronunciation: "lah froo-tah" },
      { word: "bread", translation: "il pane", pronunciation: "eel pah-neh" },
      { word: "milk", translation: "il latte", pronunciation: "eel lah-teh" },
      { word: "vegetables", translation: "le verdure", pronunciation: "leh vehr-doo-reh" },
    ],
  },
  ja: {
    restaurant: [
      { word: "table", translation: "テーブル", pronunciation: "tay-bu-ru" },
      { word: "menu", translation: "メニュー", pronunciation: "me-nyu" },
      { word: "water", translation: "水", pronunciation: "mizu" },
      { word: "coffee", translation: "コーヒー", pronunciation: "ko-hi" },
    ],
    airport: [
      { word: "flight", translation: "飛行機", pronunciation: "hi-ko-ki" },
      { word: "passport", translation: "パスポート", pronunciation: "pa-su-po-to" },
      { word: "luggage", translation: "荷物", pronunciation: "ni-mo-tsu" },
      { word: "gate", translation: "ゲート", pronunciation: "ge-to" },
    ],
    grocery: [
      { word: "fruit", translation: "果物", pronunciation: "ku-da-mo-no" },
      { word: "bread", translation: "パン", pronunciation: "pan" },
      { word: "milk", translation: "牛乳", pronunciation: "gyu-nyu" },
      { word: "vegetables", translation: "野菜", pronunciation: "ya-sa-i" },
    ],
  },
  zh: {
    restaurant: [
      { word: "table", translation: "桌子", pronunciation: "zhuō zi" },
      { word: "menu", translation: "菜单", pronunciation: "cài dān" },
      { word: "water", translation: "水", pronunciation: "shuǐ" },
      { word: "coffee", translation: "咖啡", pronunciation: "kā fēi" },
    ],
    airport: [
      { word: "flight", translation: "航班", pronunciation: "háng bān" },
      { word: "passport", translation: "护照", pronunciation: "hù zhào" },
      { word: "luggage", translation: "行李", pronunciation: "xíng lǐ" },
      { word: "gate", translation: "登机口", pronunciation: "dēng jī kǒu" },
    ],
    grocery: [
      { word: "fruit", translation: "水果", pronunciation: "shuǐ guǒ" },
      { word: "bread", translation: "面包", pronunciation: "miàn bāo" },
      { word: "milk", translation: "牛奶", pronunciation: "niú nǎi" },
      { word: "vegetables", translation: "蔬菜", pronunciation: "shū cài" },
    ],
  },
  ko: {
    restaurant: [
      { word: "table", translation: "테이블", pronunciation: "tei-beul" },
      { word: "menu", translation: "메뉴", pronunciation: "me-nyu" },
      { word: "water", translation: "물", pronunciation: "mul" },
      { word: "coffee", translation: "커피", pronunciation: "keo-pi" },
    ],
    airport: [
      { word: "flight", translation: "항공편", pronunciation: "hang-gong-pyeon" },
      { word: "passport", translation: "여권", pronunciation: "yeo-gwon" },
      { word: "luggage", translation: "수하물", pronunciation: "su-ha-mul" },
      { word: "gate", translation: "게이트", pronunciation: "ge-i-teu" },
    ],
    grocery: [
      { word: "fruit", translation: "과일", pronunciation: "gwa-il" },
      { word: "bread", translation: "빵", pronunciation: "ppang" },
      { word: "milk", translation: "우유", pronunciation: "u-yu" },
      { word: "vegetables", translation: "채소", pronunciation: "chae-so" },
    ],
  },
  ru: {
    restaurant: [
      { word: "table", translation: "стол", pronunciation: "stol" },
      { word: "menu", translation: "меню", pronunciation: "me-nyu" },
      { word: "water", translation: "вода", pronunciation: "va-da" },
      { word: "coffee", translation: "кофе", pronunciation: "ko-fe" },
    ],
    airport: [
      { word: "flight", translation: "рейс", pronunciation: "rays" },
      { word: "passport", translation: "паспорт", pronunciation: "pas-port" },
      { word: "luggage", translation: "багаж", pronunciation: "ba-gazh" },
      { word: "gate", translation: "выход", pronunciation: "vy-khod" },
    ],
    grocery: [
      { word: "fruit", translation: "фрукт", pronunciation: "frookt" },
      { word: "bread", translation: "хлеб", pronunciation: "khleb" },
      { word: "milk", translation: "молоко", pronunciation: "ma-la-ko" },
      { word: "vegetables", translation: "овощи", pronunciation: "o-va-shchi" },
    ],
  },
  ar: {
    restaurant: [
      { word: "table", translation: "طاولة", pronunciation: "taa-wi-la" },
      { word: "menu", translation: "قائمة", pronunciation: "qaa-i-ma" },
      { word: "water", translation: "ماء", pronunciation: "maa" },
      { word: "coffee", translation: "قهوة", pronunciation: "qah-wa" },
    ],
    airport: [
      { word: "flight", translation: "رحلة", pronunciation: "rih-la" },
      { word: "passport", translation: "جواز سفر", pronunciation: "ja-waaz sa-far" },
      { word: "luggage", translation: "أمتعة", pronunciation: "am-ti-'a" },
      { word: "gate", translation: "بوابة", pronunciation: "baw-waa-ba" },
    ],
    grocery: [
      { word: "fruit", translation: "فاكهة", pronunciation: "faa-ki-ha" },
      { word: "bread", translation: "خبز", pronunciation: "khubz" },
      { word: "milk", translation: "حليب", pronunciation: "ha-leeb" },
      { word: "vegetables", translation: "خضروات", pronunciation: "khud-ra-waat" },
    ],
  },
  // Add Bengali (Bangladesh) language
  bn: {
    restaurant: [
      { word: "table", translation: "টেবিল", pronunciation: "te-bil" },
      { word: "menu", translation: "মেনু", pronunciation: "me-nu" },
      { word: "water", translation: "পানি", pronunciation: "pa-ni" },
      { word: "coffee", translation: "কফি", pronunciation: "ko-fi" },
    ],
    airport: [
      { word: "flight", translation: "ফ্লাইট", pronunciation: "flai-t" },
      { word: "passport", translation: "পাসপোর্ট", pronunciation: "pas-port" },
      { word: "luggage", translation: "লাগেজ", pronunciation: "la-gej" },
      { word: "gate", translation: "গেট", pronunciation: "get" },
    ],
    grocery: [
      { word: "fruit", translation: "ফল", pronunciation: "fol" },
      { word: "bread", translation: "রুটি", pronunciation: "ru-ti" },
      { word: "milk", translation: "দুধ", pronunciation: "dudh" },
      { word: "vegetables", translation: "সবজি", pronunciation: "sob-ji" },
    ],
  },
  // English is provided for completeness
  en: {
    restaurant: [
      { word: "table", translation: "table", pronunciation: "tey-buhl" },
      { word: "menu", translation: "menu", pronunciation: "men-yoo" },
      { word: "water", translation: "water", pronunciation: "waw-ter" },
      { word: "coffee", translation: "coffee", pronunciation: "kaw-fee" },
    ],
    airport: [
      { word: "flight", translation: "flight", pronunciation: "flahyt" },
      { word: "passport", translation: "passport", pronunciation: "pas-pawrt" },
      { word: "luggage", translation: "luggage", pronunciation: "luhg-ij" },
      { word: "gate", translation: "gate", pronunciation: "geyt" },
    ],
    grocery: [
      { word: "fruit", translation: "fruit", pronunciation: "froot" },
      { word: "bread", translation: "bread", pronunciation: "bred" },
      { word: "milk", translation: "milk", pronunciation: "milk" },
      { word: "vegetables", translation: "vegetables", pronunciation: "vej-tuh-buhls" },
    ],
  },
};

const ContextualVocabulary = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [activeWord, setActiveWord] = useState<TranslationItem | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchScenarios();
  }, [selectedLanguage]);

  const fetchScenarios = async () => {
    setIsLoading(true);
    try {
      // Fetch vocabulary items grouped by scenario
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', selectedLanguage)
        .not('scenario', 'is', null);

      if (error) {
        throw error;
      }

      // If no data is available yet in the database, use the default scenarios
      if (!data || data.length === 0) {
        // Get default translations for the selected language
        const languageTranslations = defaultTranslations[selectedLanguage as keyof typeof defaultTranslations] || defaultTranslations.en;
        
        const defaultScenarios = [
          {
            id: "restaurant",
            title: "At the Restaurant",
            image: "/placeholder.svg",
            vocabulary: languageTranslations.restaurant.map(item => ({
              ...item,
              language_code: selectedLanguage
            })),
          },
          {
            id: "airport",
            title: "At the Airport",
            image: "/placeholder.svg",
            vocabulary: languageTranslations.airport.map(item => ({
              ...item,
              language_code: selectedLanguage
            })),
          },
          {
            id: "grocery",
            title: "Grocery Shopping",
            image: "/placeholder.svg",
            vocabulary: languageTranslations.grocery.map(item => ({
              ...item,
              language_code: selectedLanguage
            })),
          },
        ];
        
        setScenarios(defaultScenarios);
        setSelectedScenario(defaultScenarios[0]);
      } else {
        // Group the data by scenario
        const scenarioMap = data.reduce((acc: Record<string, any[]>, item: any) => {
          if (!acc[item.scenario]) {
            acc[item.scenario] = [];
          }
          acc[item.scenario].push(item);
          return acc;
        }, {});
        
        // Convert to the format we need
        const formattedScenarios = Object.entries(scenarioMap).map(([id, items]) => {
          // Find a title based on the scenario ID
          let title;
          switch(id) {
            case "restaurant": title = "At the Restaurant"; break;
            case "airport": title = "At the Airport"; break;
            case "grocery": title = "Grocery Shopping"; break;
            default: title = id.charAt(0).toUpperCase() + id.slice(1);
          }
          
          return {
            id,
            title,
            image: items[0]?.image_url || "/placeholder.svg",
            vocabulary: items.map(item => ({
              word: item.word,
              translation: item.translation,
              pronunciation: item.pronunciation || "Pronunciation not available",
              language_code: item.language_code
            })),
          };
        });
        
        setScenarios(formattedScenarios);
        setSelectedScenario(formattedScenarios[0] || null);
      }
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      toast({
        title: "Error",
        description: "Failed to load vocabulary data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordClick = (word: TranslationItem) => {
    setActiveWord(word);
    
    // Improved pronunciation with better error handling
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word.translation);
        utterance.lang = word.language_code;

        // Special mapping for languages that need specific BCP 47 language tags
        const langMap: Record<string, string> = {
          'zh': 'zh-CN',
          'ar': 'ar-SA',
          'bn': 'bn-BD',
          'ja': 'ja-JP',
          'ko': 'ko-KR'
        };
        
        if (langMap[word.language_code]) {
          utterance.lang = langMap[word.language_code];
        }
        
        speechSynthesis.cancel(); // Cancel any ongoing speech
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Speech synthesis error:", error);
      toast({
        title: "Pronunciation Error",
        description: "Could not pronounce this word. Using text guide instead.",
        variant: "destructive",
      });
    }
  };

  const handleCameraCapture = async (imageDataURL: string) => {
    try {
      setIsUploading(true);
      const file = dataURLtoFile(imageDataURL, "camera-capture.jpg");
      const resizedDataURL = await resizeImage(file);
      const resizedFile = dataURLtoFile(resizedDataURL, "camera-capture.jpg");
      
      const imageUrl = await uploadImage(resizedFile, "vocabulary_images");
      
      if (imageUrl && selectedScenario) {
        toast({
          title: "Image Captured",
          description: "Image has been uploaded successfully!",
        });
        
        // Update the scenario image in the UI
        setScenarios(prev => 
          prev.map(scenario => 
            scenario.id === selectedScenario.id 
              ? { ...scenario, image: imageUrl } 
              : scenario
          )
        );
        
        setSelectedScenario({ ...selectedScenario, image: imageUrl });
        
        // Here you could also update the image_url in the database if needed
      } else {
        toast({
          title: "Error",
          description: "Failed to upload the image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing camera capture:", error);
      toast({
        title: "Error",
        description: "Failed to process the captured image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setShowCamera(false); // Close camera modal after capture attempt regardless of success/failure
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const resizedDataURL = await resizeImage(file);
      const resizedFile = dataURLtoFile(resizedDataURL, file.name);
      
      const imageUrl = await uploadImage(resizedFile, "vocabulary_images");
      
      if (imageUrl && selectedScenario) {
        toast({
          title: "Image Uploaded",
          description: "Image has been uploaded successfully!",
        });
        
        // Update the scenario image in the UI
        setScenarios(prev => 
          prev.map(scenario => 
            scenario.id === selectedScenario.id 
              ? { ...scenario, image: imageUrl } 
              : scenario
          )
        );
        
        setSelectedScenario({ ...selectedScenario, image: imageUrl });
        
        // Here you could also update the image_url in the database if needed
      } else {
        toast({
          title: "Error",
          description: "Failed to upload the image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing file upload:", error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleScenarioChange = (value: string) => {
    const scenario = scenarios.find((s) => s.id === value);
    if (scenario) setSelectedScenario(scenario);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setActiveWord(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Contextual Vocabulary Practice</h1>
        <p className="text-xl">
          Learn vocabulary in real-life situations. Select a scenario and explore!
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Select
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {languageCodes.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <span className="mr-2">{language.flag}</span> {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedScenario?.id || ""}
          onValueChange={handleScenarioChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {scenario.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : selectedScenario ? (
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Scenario Visual */}
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">{selectedScenario.title}</h2>
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : null}
              <img
                src={selectedScenario.image}
                alt={selectedScenario.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => setShowCamera(true)}
                disabled={isUploading}
              >
                <Camera className="mr-2" />
                Use Camera
              </Button>
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </Card>

          {/* Vocabulary List */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Common Words & Phrases</h3>
            <div className="grid gap-3">
              {selectedScenario.vocabulary.map((item) => (
                <Button
                  key={item.word}
                  variant="outline"
                  className={`w-full justify-start ${
                    activeWord?.word === item.word ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleWordClick(item)}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">{item.word}</span>
                  <span className="text-gray-500 dark:text-gray-300">{item.translation}</span>
                </Button>
              ))}
            </div>
            
            {activeWord && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">Pronunciation Guide</h4>
                <p className="dark:text-gray-300">{activeWord.pronunciation}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    try {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(activeWord.translation);
                        
                        // Special mapping for languages that need specific BCP 47 language tags
                        const langMap: Record<string, string> = {
                          'zh': 'zh-CN',
                          'ar': 'ar-SA',
                          'bn': 'bn-BD',
                          'ja': 'ja-JP',
                          'ko': 'ko-KR'
                        };
                        
                        utterance.lang = langMap[activeWord.language_code] || activeWord.language_code;
                        
                        speechSynthesis.cancel(); // Cancel any ongoing speech
                        speechSynthesis.speak(utterance);
                      }
                    } catch (error) {
                      console.error("Speech synthesis error:", error);
                    }
                  }}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Listen
                </Button>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="text-center p-8">
          <p>No scenario selected. Please select a scenario from the dropdown.</p>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Hidden audio element for custom pronunciation files if needed */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default ContextualVocabulary;
