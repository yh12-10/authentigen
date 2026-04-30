import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CustomCursor } from "@/components/visual/CustomCursor";
import { DriftingOrbs } from "@/components/visual/DriftingOrbs";
import { LoadingScreen } from "@/components/visual/LoadingScreen";
import { NoiseOverlay } from "@/components/visual/NoiseOverlay";
import { ScrollProgress } from "@/components/visual/ScrollProgress";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Process from "./pages/Process";
import Admin from "./pages/Admin";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import BatchUpload from "./pages/BatchUpload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/upload" component={Upload} />
      <Route path="/batch" component={BatchUpload} />
      <Route path="/process/:jobId" component={Process} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/billing/success" component={BillingSuccess} />
      <Route path="/billing/cancel" component={BillingCancel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(20,20,20,0.92)",
                border: "1px solid rgba(245,166,35,0.25)",
                color: "#FFFFFF",
                backdropFilter: "blur(20px)",
              },
            }}
          />
          <LoadingScreen />
          <ScrollProgress />
          <DriftingOrbs />
          <NoiseOverlay />
          <CustomCursor />
          <div className="relative z-[2]">
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
