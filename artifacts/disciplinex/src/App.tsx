import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter, Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { Suspense, lazy, useState } from "react";

const OnboardPage = lazy(() => import("@/pages/auth"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Planner = lazy(() => import("@/pages/planner"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Goals = lazy(() => import("@/pages/goals"));
const Insights = lazy(() => import("@/pages/insights"));
const Profile = lazy(() => import("@/pages/profile"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 0, retry: 1 },
  },
});

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="size-10 rounded-2xl bg-gradient-primary animate-pulse-glow grid place-items-center shadow-glow">
        <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function isOnboarded() {
  try {
    const p = JSON.parse(localStorage.getItem("dx_profile") ?? "null");
    return typeof p?.name === "string" && p.name.trim().length > 0;
  } catch { return false; }
}

function AppRoutes() {
  const [ready, setReady] = useState(() => isOnboarded());

  if (!ready) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <OnboardPage onComplete={() => setReady(true)} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/planner" component={Planner} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/goals" component={Goals} />
        <Route path="/insights" component={Insights} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""}>
          <AppRoutes />
        </WouterRouter>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "hsl(262 16% 15% / 0.9)",
              border: "1px solid hsl(262 18% 22% / 0.6)",
              backdropFilter: "blur(20px)",
              color: "hsl(262 5% 97%)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
