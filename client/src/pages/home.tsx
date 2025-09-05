import { Route, Switch } from "wouter";
import { useState, createContext, useContext } from "react";
import { Header } from "../components/header";
import { AuthPage } from "./auth";
import { MainMenu } from "./main-menu";
import { ReportFound } from "./report-found";
import { ReportLost } from "./report-lost";
import { MyFoundItems } from "./my-found-items";
import { ChatHistory } from "./chat-history";
import { ChatPage } from "./chat";
import type { AuthUser, AppContextType } from "../types";

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

export const useApp = () => useContext(AppContext);

export function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleLogout = () => {
    setUser(null);
    window.location.href = "/";
  };

  const contextValue: AppContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={handleLogout} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!user ? (
            <AuthPage />
          ) : (
            <Switch>
              <Route path="/" component={MainMenu} />
              <Route path="/main-menu" component={MainMenu} />
              <Route path="/report-found" component={ReportFound} />
              <Route path="/report-lost" component={ReportLost} />
              <Route path="/my-found-items" component={MyFoundItems} />
              <Route path="/chat-history" component={ChatHistory} />
              <Route path="/chat/:chatId" component={ChatPage} />
              <Route component={MainMenu} />
            </Switch>
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}
