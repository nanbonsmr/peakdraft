import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import Usage from "./pages/Usage";
import Templates from "./pages/Templates";
import Tasks from "./pages/Tasks";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PublicPricing from "./pages/PublicPricing";
import Features from "./pages/Features";
import ResetPassword from "./pages/ResetPassword";
import FreeTools from "./pages/FreeTools";
import Tools from "./pages/Tools";
import DashboardFreeAITools from "./pages/DashboardFreeAITools";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import SharedTask from "./pages/SharedTask";
import SocialMedia from "./pages/SocialMedia";
import WorkflowLanding from "./pages/WorkflowLanding";
import NotFound from "./pages/NotFound";
import Editor from "./pages/Editor";
import DashboardTools from "./pages/DashboardTools";
import ImageGeneration from "./pages/ImageGeneration";
import Avatars from "./pages/Avatars";
import LinkedInPage from "./pages/LinkedIn";
import LinkedInCallback from "./pages/LinkedInCallback";
import Chat from "./pages/Chat";
import Infobase from "./pages/Infobase";
import Humanizer from "./pages/Humanizer";
import WorkflowHistory from "./pages/WorkflowHistory";
import Workflows from "./pages/Workflows";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/refund" element={<PageTransition><RefundPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PublicPricing /></PageTransition>} />
        <Route path="/features" element={<PageTransition><Features /></PageTransition>} />
        <Route path="/free-tools" element={<PageTransition><FreeTools /></PageTransition>} />
        <Route path="/tools" element={<PageTransition><Tools /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/social-media" element={<PageTransition><SocialMedia /></PageTransition>} />
        <Route path="/workflows" element={<PageTransition><WorkflowLanding /></PageTransition>} />
        <Route path="/shared/task/:token" element={<PageTransition><SharedTask /></PageTransition>} />
        <Route path="/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/app/*" element={
          <ProtectedRoute>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset className="flex-1">
                  <Header />
                  <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    <AnimatePresence mode="wait">
                      <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                        <Route path="chat" element={<PageTransition><Chat /></PageTransition>} />
                        <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
                        <Route path="usage" element={<PageTransition><Usage /></PageTransition>} />
                        <Route path="templates" element={<PageTransition><Templates /></PageTransition>} />
                        <Route path="templates/*" element={<PageTransition><Templates /></PageTransition>} />
                        <Route path="tasks" element={<PageTransition><Tasks /></PageTransition>} />
                        <Route path="pricing" element={<PageTransition><Pricing /></PageTransition>} />
                        <Route path="editor" element={<PageTransition><Editor /></PageTransition>} />
                        <Route path="tools" element={<PageTransition><DashboardTools /></PageTransition>} />
                        <Route path="free-ai-tools" element={<PageTransition><DashboardFreeAITools /></PageTransition>} />
                        <Route path="image-generation" element={<PageTransition><ImageGeneration /></PageTransition>} />
                        <Route path="avatars" element={<PageTransition><Avatars /></PageTransition>} />
                        <Route path="linkedin" element={<PageTransition><LinkedInPage /></PageTransition>} />
                        <Route path="infobase" element={<PageTransition><Infobase /></PageTransition>} />
                        <Route path="humanizer" element={<PageTransition><Humanizer /></PageTransition>} />
                        <Route path="workflow" element={<PageTransition><Workflows /></PageTransition>} />
                        <Route path="workflows" element={<PageTransition><Workflows /></PageTransition>} />
                        <Route path="workflow-history" element={<PageTransition><WorkflowHistory /></PageTransition>} />
                      </Routes>
                    </AnimatePresence>
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </ProtectedRoute>
        } />
        {/* Admin Routes - Separate Layout */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageTransition><AdminOverview /></PageTransition>} />
                  <Route path="analytics" element={<PageTransition><AdminAnalytics /></PageTransition>} />
                  <Route path="blog" element={<PageTransition><AdminBlog /></PageTransition>} />
                  <Route path="blog/new" element={<PageTransition><AdminBlogEditor /></PageTransition>} />
                  <Route path="blog/edit/:id" element={<PageTransition><AdminBlogEditor /></PageTransition>} />
                  <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
                  <Route path="templates" element={<PageTransition><AdminTemplates /></PageTransition>} />
                  <Route path="promotions" element={<PageTransition><AdminPromotions /></PageTransition>} />
                  <Route path="notifications" element={<PageTransition><AdminNotifications /></PageTransition>} />
                  <Route path="settings" element={<PageTransition><AdminSettings /></PageTransition>} />
                </Routes>
              </AnimatePresence>
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
