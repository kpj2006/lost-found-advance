import { useState } from "react";

import { UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { api } from "../lib/api";
import { useApp } from "./home";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setMessage("Please enter both email and password");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login(email.trim(), password.trim());
      setUser(response.user);
      setMessage(`Signed in as ${response.user.email}`);
      setMessageType("success");
    } catch (error) {
      setMessage("Login failed. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg border border-border">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-6">
            <UserCircle className="text-primary text-4xl mb-3 h-12 w-12 mx-auto" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome!</h2>
            <p className="text-muted-foreground">Sign in to access the Lost & Found Portal</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                data-testid="input-password"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-signin"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          {message && (
            <div className={`mt-4 text-center text-sm ${messageType === 'success' ? 'text-secondary' : 'text-destructive'}`} data-testid="text-auth-message">
              {message}
            </div>
          )}
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Demo mode: Any credentials will work for testing
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
