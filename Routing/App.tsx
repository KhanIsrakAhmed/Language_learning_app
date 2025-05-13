
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dictionary from "./pages/Dictionary";
import Forum from "./pages/Forum";
import Quiz from "./pages/Quiz";
import Gamification from "./pages/Gamification";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import ContextualVocabulary from "./pages/ContextualVocabulary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/gamification" element={<Gamification />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contextual-vocabulary" element={<ContextualVocabulary />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
