import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/components/TranslationProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";
import SkipNavigation from "@/components/SkipNavigation";
import QuickActionFAB from "@/components/QuickActionFAB";
import OnboardingTour from "@/components/OnboardingTour";
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
import Profile from "./pages/Profile";
import Help from "./pages/Help";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TranslationProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-right" />
              <SkipNavigation />
              <OfflineIndicator />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/voice" element={<Voice />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/radio" element={<Radio />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/safety" element={<Safety />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/proposals/:slug" element={<ProposalDetail />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/help" element={<Help />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <OnboardingTour />
                <QuickActionFAB />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
