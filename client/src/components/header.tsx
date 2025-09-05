import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { AuthUser } from "../types";

interface HeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Search className="text-primary text-2xl h-6 w-6" />
            <h1 className="text-xl font-semibold text-foreground">Lost & Found Portal</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Signed in as:</span>
              <span className="font-medium text-foreground" data-testid="text-user-email">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-destructive hover:text-destructive"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
