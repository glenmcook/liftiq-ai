import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Dashboard from './pages/dashboard';
import Onboarding from './pages/onboarding';
import Plan from './pages/plan';
import DayDetail from './pages/day-detail';
import ActiveWorkout from './pages/active-workout';
import SessionHistory from './pages/history';
import Progress from './pages/progress';
import Dexa from './pages/dexa';
import Checkin from './pages/checkin';
import Settings from './pages/settings';
import Recommendations from './pages/recommendations';
import Library from './pages/library';
import Diet from './pages/diet';
import Pricing from './pages/pricing';
import CheckoutSuccess from './pages/checkout-success';
import Docs from './pages/docs';
import Login from './pages/login';

const BASE = import.meta.env.BASE_URL;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/plan" component={Plan} />
      <Route path="/day/:id" component={DayDetail} />
      <Route path="/workout/:id" component={ActiveWorkout} />
      <Route path="/history" component={SessionHistory} />
      <Route path="/progress" component={Progress} />
      <Route path="/dexa" component={Dexa} />
      <Route path="/checkin" component={Checkin} />
      <Route path="/settings" component={Settings} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/library" component={Library} />
      <Route path="/diet" component={Diet} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/docs" component={Docs} />
      <Route>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground font-mono tracking-widest space-y-4">
          <div className="text-4xl font-extrabold text-primary">404</div>
          <div>SECTOR NOT FOUND</div>
        </div>
      </Route>
    </Switch>
  );
}

/**
 * Wraps the app in an auth gate.  On first load it checks the session with
 * the API; if not authenticated it shows the Login page.  Once the user logs
 * in, the query is invalidated and the main app renders.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["auth-check"],
    queryFn: async () => {
      const res = await fetch(`${BASE}api/auth/check`, {
        credentials: "same-origin",
      });
      if (!res.ok) return { authenticated: false };
      return res.json();
    },
    // Re-check every 5 minutes in case the session expires
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) {
    // Brief blank screen while checking auth — avoids any flash of the login page
    // for already-authenticated sessions
    return null;
  }

  if (!data?.authenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AuthGate>
          <Router />
        </AuthGate>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
