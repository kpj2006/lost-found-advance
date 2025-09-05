import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, MessageCircle, LogOut, Package } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "./home";

export function MainMenu() {
  const { user } = useApp();

  if (!user) return null;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Main Menu</h2>
        <p className="text-muted-foreground">What would you like to do today?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Link href="/report-found">
          <Card className="hover:bg-secondary/10 border border-border p-6 transition-colors group cursor-pointer">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                <PlusCircle className="text-secondary text-xl h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Report Found Item</h3>
            </div>
            <p className="text-muted-foreground text-sm">Found something? Help reunite it with its owner</p>
          </Card>
        </Link>
        
        <Link href="/report-lost">
          <Card className="hover:bg-accent/10 border border-border p-6 transition-colors group cursor-pointer">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Search className="text-accent text-xl h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Report Lost Item</h3>
            </div>
            <p className="text-muted-foreground text-sm">Lost something? Let us help you find it</p>
          </Card>
        </Link>
        
        <Link href="/my-found-items">
          <Card className="hover:bg-green-500/10 border border-border p-6 transition-colors group cursor-pointer">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <Package className="text-green-500 text-xl h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">My Found Items</h3>
            </div>
            <p className="text-muted-foreground text-sm">View and manage your reported found items</p>
          </Card>
        </Link>
        
        <Link href="/chat-history">
          <Card className="hover:bg-primary/10 border border-border p-6 transition-colors group cursor-pointer">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <MessageCircle className="text-primary text-xl h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">View Previous Chats</h3>
            </div>
            <p className="text-muted-foreground text-sm">Review your chat history and conversations</p>
          </Card>
        </Link>
        
        <div className="md:col-span-2">
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="w-full hover:bg-destructive/10 border border-border p-6 h-auto text-left group"
            data-testid="button-logout-menu"
          >
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center group-hover:bg-destructive/30 transition-colors">
                <LogOut className="text-destructive text-xl h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Logout</h3>
            </div>
            <p className="text-muted-foreground text-sm">Sign out of your account</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
