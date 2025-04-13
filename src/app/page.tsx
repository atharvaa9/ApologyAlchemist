"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateApology } from "@/ai/flows/generate-apology";
import { adjustApologyTone } from "@/ai/flows/tone-adjustment";
import { getImprovementSuggestions } from "@/ai/flows/message-suggestions";
import { Input } from "@/components/ui/input";
import { sendMessage, Message } from "@/services/message-sender";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const { user, signOut } = useAuth();
  const [manualMessage, setManualMessage] = useState("");
  const [aiContext, setAiContext] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [senderName, setSenderName] = useState("");
  const [tone, setTone] = useState("heartfelt"); // Default tone
  const [previewVisible, setPreviewVisible] = useState(false);
  const { toast } = useToast();
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiContext || !recipient || !senderName) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields for AI generation.",
      });
      return;
    }

    try {
      const result = await generateApology({
        context: aiContext,
        recipient: recipient,
        senderName: senderName,
        tone: tone,
      });
      setGeneratedMessage(result.apologyMessage);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: error.message || "Failed to generate apology message. Please try again.",
      });
    }
  };

  const handleToneAdjustment = async () => {
    if (!generatedMessage || !tone) {
      toast({
        title: "Missing Fields",
        description: "Please generate a message and select a tone first.",
      });
      return;
    }

    try {
      const result = await adjustApologyTone({
        message: generatedMessage,
        tone: tone,
      });
      setGeneratedMessage(result.adjustedMessage);
    } catch (error: any) {
      console.error("Tone Adjustment Error:", error);
      toast({
        variant: "destructive",
        title: "Tone Adjustment Failed",
        description: error.message || "Failed to adjust tone. Please try again.",
      });
    }
  };

  const handleGetImprovementSuggestions = async () => {
    if (!generatedMessage || !aiContext) {
      toast({
        title: "Missing Fields",
        description: "Please generate a message and provide context first.",
      });
      return;
    }

    try {
      const result = await getImprovementSuggestions({
        message: generatedMessage,
        context: aiContext,
      });

      if (result.suggestions && result.suggestions.length > 0) {
        const suggestionList = result.suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ));
        toast({
          title: "Improvement Suggestions",
          description: <ul>{suggestionList}</ul>,
        });
      } else {
        toast({
          title: "No Suggestions Found",
          description: "The AI found no suggestions for improving this message.",
        });
      }
    } catch (error: any) {
      console.error("Improvement Suggestions Error:", error);
      toast({
        variant: "destructive",
        title: "Suggestions Retrieval Failed",
        description: error.message || "Failed to get improvement suggestions. Please try again.",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!recipient || (!manualMessage && !generatedMessage)) {
      toast({
        title: "Missing Information",
        description: "Please provide a recipient and a message.",
        variant: "destructive"
      });
      return;
    }

    try {
      const messageContent = manualMessage || generatedMessage;
      
      const docRef = await addDoc(collection(db, 'messages'), {
        content: messageContent,
        recipient,
        createdAt: new Date().toISOString(),
        senderName,
        userId: 'anonymous'
      });

      // Generate shareable URL
      const url = `${window.location.origin}/message/${docRef.id}`;
      setShareableUrl(url);
      setShowOutput(true);

      // Scroll to output section
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

    } catch (error: any) {
      console.error("Error creating message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create message. Please try again.",
      });
    }
  };

  const handleCopyMessage = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage);
      toast({
        title: "Message Copied",
        description: "The generated message has been copied to your clipboard.",
      });
    } else {
      toast({
        title: "No Message to Copy",
        description: "Please generate a message first.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "Failed to log out. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* <div className="flex justify-end mb-4">
        {user && (
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="gap-2"
          >
            <span>Logout</span>
            {user.email && <span className="text-sm text-muted-foreground">({user.email})</span>}
          </Button>
        )}
      </div> */}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Manual Message Input Section */}
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Apology Manually</CardTitle>
              <CardDescription>Write your apology message here.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Textarea
                placeholder="Enter your apology message..."
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* AI Apology Generator Section */}
        <div className="w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>AI Apology Generator</CardTitle>
              <CardDescription>Let AI help you craft the perfect apology.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Input
                type="text"
                placeholder="Recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Your Name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
              <Textarea
                placeholder="Context: What happened and why are you apologizing?"
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Tone (e.g., heartfelt, playful)"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleAiGenerate} className="bg-primary text-primary-foreground hover:bg-primary/80">
                  Generate with AI
                </Button>
                <Button onClick={handleToneAdjustment} variant="secondary">
                  Adjust Tone
                </Button>
                <Button onClick={handleGetImprovementSuggestions} variant="secondary">
                  Get Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Display and Preview */}
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Message Preview</CardTitle>
              <CardDescription>Preview and send your apology message.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="p-4 rounded-md bg-secondary/50">
                {generatedMessage || manualMessage || "No message composed yet."}
              </div>
              <div className="flex gap-2">
               <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleCopyMessage} disabled={!generatedMessage}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy message</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Click to copy
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button onClick={() => setPreviewVisible(!previewVisible)} variant="secondary">
                  {previewVisible ? "Hide Preview" : "Show Preview"}
                </Button>
                <Button onClick={handleSendMessage} className="bg-accent text-accent-foreground hover:bg-accent/80">
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showOutput && shareableUrl && (
        <Card className="mt-8 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-xl">Message Ready! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">
                Copy this link and send it to {recipient}:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 p-2 rounded border bg-background text-sm font-mono"
                />
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareableUrl);
                      toast({
                        title: "Copied!",
                        description: "Link copied to clipboard",
                      });
                    } catch (error) {
                      toast({
                        title: "Copy failed",
                        description: "Please copy the link manually",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Copy Link
                </button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <h3 className="font-medium text-foreground mb-2">Next steps:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy the link above</li>
                <li>Send it to {recipient}</li>
                <li>They can view your message by opening the link</li>
              </ol>
            </div>

            <button
              onClick={() => {
                setShowOutput(false);
                setShareableUrl(null);
                // Reset other form fields if needed
              }}
              className="w-full mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              Create Another Message
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
