import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wand2, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "./home";
import { api } from "../lib/api";
import { ImageUpload } from "../components/ImageUpload";

export function ReportFound() {
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        response = await api.analyzeImage(selectedImage, "found");
        setImageData(response.imageData);
      } else {
        response = await api.generatePrompt(description, imageUrl, "found");
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
      await api.createFoundItem({
        userId: user.id,
        prompt: generatedPrompt,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageData: imageData || undefined,
      });

      setShowSuccess(true);
      setShowPrompt(false);
      
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (error) {
      alert("Failed to submit found item. Please try again.");
    } finally {
      setIsSubmitting(false);
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
            <h2 className="text-2xl font-semibold text-foreground">Report Found Item</h2>
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
                  label="Upload Item Photo"
                />
                <div className="text-center text-muted-foreground text-sm">or</div>
                <div>
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (optional)"
                    className="w-full"
                    data-testid="input-found-image-url"
                    disabled={!!selectedImage}
                  />
                </div>
                <div className="text-center text-muted-foreground text-sm">or</div>
                <div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe the item (e.g., 'red wallet', 'black smartphone')"
                    className="w-full resize-none"
                    data-testid="input-found-description"
                    disabled={!!selectedImage}
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleGeneratePrompt}
              disabled={isGenerating}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              data-testid="button-generate-found-prompt"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate AI Description"}
            </Button>
            
            {showPrompt && (
              <div data-testid="section-found-prompt-preview">
                <Label className="block text-sm font-medium text-foreground mb-2">Generated Description (Editable)</Label>
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  rows={4}
                  className="w-full resize-none"
                  data-testid="textarea-edit-found-prompt"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  Edit the description if needed. This will help match your item with people looking for lost items.
                </div>
                
                <div className="mt-4 flex space-x-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !generatedPrompt.trim()}
                    className="flex-1"
                    data-testid="button-submit-found"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Found Item"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    data-testid="button-reset-found"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
            
            {showSuccess && (
              <div className="bg-secondary/10 border border-secondary/20 rounded-md p-4" data-testid="section-found-success">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-secondary h-5 w-5" />
                  <span className="text-secondary font-medium">Success!</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Your found item has been added to the system.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
