import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wand2, CheckCircle, Info, Image } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useApp } from "./home";
import { api } from "../lib/api";
import { ImageUpload } from "../components/ImageUpload";

interface Match {
  item: any;
  matchScore: number;
}

export function ReportLost() {
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [showNoMatches, setShowNoMatches] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useApp();

  const handleGeneratePrompt = async () => {
    if (!selectedImage && !imageUrl.trim() && !description.trim()) {
      alert("Please provide an image, image URL, or description");
      return;
    }

    setIsGenerating(true);
    try {
      let response;
      if (selectedImage) {
        response = await api.analyzeImage(selectedImage, "lost");
        setImageData(response.imageData);
      } else {
        response = await api.generatePrompt(description, imageUrl, "lost");
      }
      setGeneratedPrompt(response.prompt);
      setShowPrompt(true);
    } catch (error) {
      alert("Failed to generate prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await api.createLostItem({
        userId: user.id,
        prompt: generatedPrompt,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageData: imageData || undefined,
      });

      setShowSuccess(true);
      setShowPrompt(false);

      if (response.matches && response.matches.length > 0) {
        setMatches(response.matches);
        setShowMatches(true);
        setShowNoMatches(false);
      } else {
        setShowMatches(false);
        setShowNoMatches(true);
      }
    } catch (error) {
      alert("Failed to submit lost item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartChat = async (match: Match) => {
    if (!user) return;

    try {
      const chat = await api.createChat({
        participants: [user.id, match.item.userId],
        itemId: match.item.id, // Found item ID for reference
        itemType: "lost", // Changed to lost since we're sending lost item details
        itemDescription: generatedPrompt, // Send the lost item's description
        lostItemImageData: imageData, // Send the lost item's image
      });

      setLocation(`/chat/${chat.id}`);
    } catch (error) {
      alert("Failed to start chat. Please try again.");
    }
  };

  const handleReset = () => {
    setImageUrl("");
    setDescription("");
    setSelectedImage(null);
    setImageData(null);
    setGeneratedPrompt("");
    setShowPrompt(false);
    setShowSuccess(false);
    setMatches([]);
    setShowMatches(false);
    setShowNoMatches(false);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border border-border">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Link href="/main-menu">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-semibold text-foreground">Report Lost Item</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="block text-sm font-medium text-foreground mb-3">Item Information</Label>
              <div className="space-y-4">
                <ImageUpload
                  onImageSelect={setSelectedImage}
                  onImageRemove={() => setSelectedImage(null)}
                  selectedImage={selectedImage}
                  disabled={isGenerating || isSubmitting}
                  label="Upload Photo of Lost Item"
                />
                <div className="text-center text-muted-foreground text-sm">or</div>
                <div>
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (optional)"
                    className="w-full"
                    data-testid="input-lost-image-url"
                    disabled={!!selectedImage}
                  />
                </div>
                <div className="text-center text-muted-foreground text-sm">or</div>
                <div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe the item (e.g., 'black backpack with laptop')"
                    className="w-full resize-none"
                    data-testid="input-lost-description"
                    disabled={!!selectedImage}
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleGeneratePrompt}
              disabled={isGenerating}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="button-generate-lost-prompt"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate AI Description"}
            </Button>
            
            {showPrompt && (
              <div data-testid="section-lost-prompt-preview">
                <Label className="block text-sm font-medium text-foreground mb-2">Generated Description</Label>
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  rows={4}
                  className="w-full resize-none"
                  data-testid="textarea-lost-prompt"
                />
                
                <div className="mt-4 space-y-3">
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1"
                      data-testid="button-submit-lost"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Lost Item"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      data-testid="button-reset-lost"
                    >
                      Reset
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">You can edit the description above before submitting</p>
                </div>
              </div>
            )}
            
            {showMatches && (
              <div data-testid="section-lost-matches">
                <h3 className="text-lg font-semibold text-foreground mb-4">Potential Matches Found</h3>
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => handleStartChat(match)}
                      data-testid={`card-match-${index}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">Found item that may match your lost item</h4>
                          <p className="text-sm text-muted-foreground mt-1">Found by: {match.item.userId}</p>
                          <p className="text-xs text-muted-foreground">{getTimeAgo(match.item.createdAt)}</p>
                          {match.item.imageData && (
                            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                              <Image className="h-3 w-3 mr-1" />
                              Photo available
                            </div>
                          )}
                        </div>
                        <div className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full">
                          Match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">Click on any match to start a conversation with the finder</p>
              </div>
            )}
            
            {showNoMatches && (
              <div className="bg-accent/10 border border-accent/20 rounded-md p-4" data-testid="section-no-matches">
                <div className="flex items-center space-x-2">
                  <Info className="text-accent h-5 w-5" />
                  <span className="text-accent font-medium">No matches found yet</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">We'll notify you when someone reports a matching found item.</p>
              </div>
            )}
            
            {showSuccess && (
              <div className="bg-secondary/10 border border-secondary/20 rounded-md p-4" data-testid="section-lost-success">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-secondary h-5 w-5" />
                  <span className="text-secondary font-medium">Lost item submitted!</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Your lost item has been added to our system. We'll search for matches.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
