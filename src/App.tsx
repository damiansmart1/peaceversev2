import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/components/TranslationProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Proposals from "./pages/Proposals";
import ProposalDetail from "./pages/ProposalDetail";
import Voice from "./pages/Voice";
import Community from "./pages/Community";
import Radio from "./pages/Radio";
import Challenges from "./pages/Challenges";
import Safety from "./pages/Safety";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TranslationProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/voice" element={<Voice />} />
                <Route path="/community" element={<Community />} />
                <Route path="/radio" element={<Radio />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/about" element={<About />} />
                <Route path="/proposals" element={<Proposals />} />
                <Route path="/proposals/:slug" element={<ProposalDetail />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
