import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/components/TranslationProvider";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineIndicator from "@/components/OfflineIndicator";
import SkipNavigation from "@/components/SkipNavigation";
import QuickActionFAB from "@/components/QuickActionFAB";
import OnboardingTour from "@/components/OnboardingTour";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import VoiceCommands from "@/components/VoiceCommands";
import EnhancedKeyboardNav from "@/components/EnhancedKeyboardNav";
import FocusManager from "@/components/FocusManager";
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
import AccessibilityPage from "./pages/Accessibility";
import PeacePulse from "./pages/PeacePulse";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import Verification from "./pages/Verification";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardRouter } from "./components/DashboardRouter";
import CitizenDashboard from "./pages/dashboards/CitizenDashboard";
import VerifierDashboard from "./pages/dashboards/VerifierDashboard";
import PartnerDashboard from "./pages/dashboards/PartnerDashboard";
import GovernmentDashboard from "./pages/dashboards/GovernmentDashboard";

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
          <AccessibilityProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-right" />
                <SkipNavigation />
                <OfflineIndicator />
                <BrowserRouter>
                  <FocusManager />
                  <EnhancedKeyboardNav />
                  <AccessibilityMenu />
                  <VoiceCommands />
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
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRole="admin">
                        <Admin />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute requireAuth>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute requireAuth>
                        <DashboardRouter />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/citizen" element={
                      <ProtectedRoute requireAuth>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/verifier" element={
                      <ProtectedRoute requiredRole="verifier">
                        <VerifierDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/partner" element={
                      <ProtectedRoute requiredRole="partner">
                        <PartnerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/government" element={
                      <ProtectedRoute requiredRole="government">
                        <GovernmentDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/help" element={<Help />} />
                    <Route path="/accessibility" element={<AccessibilityPage />} />
                    <Route path="/peace-pulse" element={<PeacePulse />} />
                    <Route path="/incidents" element={<Incidents />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/verification" element={<Verification />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <OnboardingTour />
                  <QuickActionFAB />
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </AccessibilityProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
