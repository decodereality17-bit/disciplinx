import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter, Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Suspense, lazy } from "react";

const AuthPage = lazy(() => import("@/pages/auth"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Planner = lazy(() => import("@/pages/planner"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Goals = lazy(() => import("@/pages/goals"));
const Insights = lazy(() => import("@/pages/insights"));
const Profile = lazy(() => import("@/pages/profile"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/auth" />;
  return <Component />;
}

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Redirect to="/" />;
  return <Component />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/auth" component={() => <PublicOnlyRoute component={AuthPage} />} />
        <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/planner" component={() => <ProtectedRoute component={Planner} />} />
        <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
        <Route path="/goals" component={() => <ProtectedRoute component={Goals} />} />
        <Route path="/insights" component={() => <ProtectedRoute component={Insights} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
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
