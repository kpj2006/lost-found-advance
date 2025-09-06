import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "./pages/not-found";
import { HomePage } from "./pages/home";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";


function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/main-menu" component={HomePage} />
      <Route path="/report-found" component={HomePage} />
      <Route path="/report-lost" component={HomePage} />
      <Route path="/my-found-items" component={HomePage} />
      <Route path="/chat-history" component={HomePage} />
      <Route path="/chat/:chatId" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
