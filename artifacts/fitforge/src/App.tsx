import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
      <Route>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground font-mono tracking-widest space-y-4">
          <div className="text-4xl font-extrabold text-primary">404</div>
          <div>SECTOR NOT FOUND</div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
