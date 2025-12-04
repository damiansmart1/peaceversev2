import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/components/TranslationProvider";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { JurisdictionProvider } from "@/contexts/JurisdictionContext";
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
import GlobalAlertBanner from "@/components/GlobalAlertBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Proposals from "./pages/Proposals";
import ProposalDetail from "./pages/ProposalDetail";
import Voice from "./pages/Voice";
import Community from "./pages/Community";
import Radio from "./pages/Radio";
import Challenges from "./pages/Challenges";
import Verification from "./pages/Verification";
import Safety from "./pages/Safety";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import AccessibilityPage from "./pages/Accessibility";
import PeacePulse from "./pages/PeacePulse";
import Incidents from "./pages/Incidents";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardRouter } from "./components/DashboardRouter";
import CitizenDashboard from "./pages/dashboards/CitizenDashboard";
import VerifierDashboard from "./pages/dashboards/VerifierDashboard";
import PartnerDashboard from "./pages/dashboards/PartnerDashboard";
import GovernmentDashboard from "./pages/dashboards/GovernmentDashboard";
import EarlyWarningDashboard from "./pages/dashboards/EarlyWarningDashboard";
import Integrations from "./pages/Integrations";
import Install from "./pages/Install";

// Preload Google Maps API on app startup for faster map loading
import '@/hooks/useGoogleMapsPreloader';

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
              <JurisdictionProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner position="top-right" />
                  <SkipNavigation />
                  <OfflineIndicator />
                  <GlobalAlertBanner />
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
                    <Route path="/verification" element={<Verification />} />
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
                    <Route path="/early-warning" element={
                      <ProtectedRoute requiredRole={["admin", "government", "partner"]}>
                        <EarlyWarningDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/help" element={<Help />} />
                    <Route path="/accessibility" element={<AccessibilityPage />} />
                    <Route path="/peace-pulse" element={<PeacePulse />} />
                    <Route path="/incidents" element={<Incidents />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/install" element={<Install />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <OnboardingTour />
                  <QuickActionFAB />
                  <PWAInstallPrompt />
                </BrowserRouter>
              </TooltipProvider>
              </JurisdictionProvider>
            </AuthProvider>
          </AccessibilityProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
