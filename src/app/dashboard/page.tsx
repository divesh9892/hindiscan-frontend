"use client";

import React, { useState, useRef } from "react";
import { 
  CloudUpload, File, Trash2, Sparkles, 
  Settings2, Key, FileJson, FileText 
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
  // --- UI STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EXTRACTION SETTINGS ---
  const [extractTablesOnly, setExtractTablesOnly] = useState(false);
  const [useLegacyFont, setUseLegacyFont] = useState(false);
  const [legacyFontName, setLegacyFontName] = useState("Kruti Dev 010");
  
  // --- BYOK (Bring Your Own Key) ---
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");

  // --- MANUAL JSON STATE ---
  const [jsonInput, setJsonInput] = useState("");

  // --- PROGRESS STATE ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // --- DRAG & DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload a PDF, JPG, or PNG.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    setFile(selectedFile);
    toast.success("File attached successfully.");
  };

  // --- MOCK SUBMISSION (We will wire FastAPI here next) ---
  const handleAutoExtract = async () => {
    if (!file) return toast.error("Please upload a document first.");
    if (useCustomKey && !customApiKey) return toast.error("Please enter your Gemini API Key.");

    setIsProcessing(true);
    setProgress(0);

    // Simulate a fluid progress bar loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    // Simulate API delay
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      toast.success("Excel report generated successfully!");
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);
    }, 4000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">New Extraction</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Upload your Hindi documents and let AI structure them into perfect Excel spreadsheets.
        </p>
      </div>

      {/* TABS ARCHITECTURE (Psychological positioning: API First) */}
      <Tabs defaultValue="auto" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="auto" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI Auto-Extract
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" /> Manual JSON
          </TabsTrigger>
        </TabsList>

        {/* 🚀 TAB 1: AI AUTO-EXTRACT (The Premium Experience) */}
        <TabsContent value="auto" className="mt-6 space-y-6">
          
          {/* DRAG AND DROP ZONE */}
          <Card className={`border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              {!file ? (
                <div 
                  className="w-full cursor-pointer flex flex-col items-center"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800 mb-4 transition-transform hover:scale-105">
                    <CloudUpload className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Click or drag file to upload</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">PDF, JPG, or PNG (Max 5MB)</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
                </div>
              ) : (
                <div className="flex w-full max-w-md items-center justify-between rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-950 dark:border-slate-800 animate-in zoom-in duration-300">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <File className="h-8 w-8 text-blue-500 shrink-0" />
                    <div className="truncate text-left">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-50">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SETTINGS MODULE */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Extraction Preferences */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4" /> Extraction Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tables-only" className="flex flex-col space-y-1">
                    <span>Extract Tables Only</span>
                    <span className="font-normal text-xs text-slate-500">Ignores paragraphs & headers</span>
                  </Label>
                  <Switch id="tables-only" checked={extractTablesOnly} onCheckedChange={setExtractTablesOnly} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="legacy-font" className="flex flex-col space-y-1">
                    <span>Enable Legacy Fonts</span>
                    <span className="font-normal text-xs text-slate-500">Apply Kruti Dev / DevLys</span>
                  </Label>
                  <Switch id="legacy-font" checked={useLegacyFont} onCheckedChange={setUseLegacyFont} />
                </div>

                {useLegacyFont && (
                  <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                    <Select value={legacyFontName} onValueChange={setLegacyFontName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Font Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kruti Dev 010">Kruti Dev 010</SelectItem>
                        <SelectItem value="DevLys 010">DevLys 010</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* BYOK (Bring Your Own Key) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Key className="h-4 w-4" /> API Key Override</CardTitle>
                <CardDescription className="text-xs">Bypass your 3 free credits by using your own Google Gemini API key.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-key-toggle">Use Custom API Key</Label>
                  <Switch id="custom-key-toggle" checked={useCustomKey} onCheckedChange={setUseCustomKey} />
                </div>
                {useCustomKey && (
                  <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                    <input 
                      type="password" 
                      placeholder="Paste Gemini API Key..." 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                    />
                    <p className="mt-2 text-xs text-slate-500">Zero-Trust: Your key never leaves browser memory.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ACTION BUTTON & PROGRESS */}
          <div className="space-y-4 pt-4">
            {isProcessing && (
              <div className="space-y-2 animate-in fade-in">
                <div className="flex justify-between text-sm font-medium">
                  <span>AI is processing document...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            <Button 
              size="lg" 
              className="w-full text-base font-semibold shadow-lg transition-all hover:scale-[1.01]"
              disabled={!file || isProcessing}
              onClick={handleAutoExtract}
            >
              {isProcessing ? "Extracting Data..." : "✨ Auto-Extract & Build Excel"}
            </Button>
          </div>

        </TabsContent>

        {/* 🚀 TAB 2: MANUAL JSON (The "Tedious" Fallback) */}
        <TabsContent value="manual" className="mt-6 space-y-6 animate-in fade-in duration-500">
          <Card>
            <CardHeader>
              <CardTitle>Manual JSON Generation</CardTitle>
              <CardDescription>
                Already have structured JSON from ChatGPT or Gemini? Paste it here to generate your Excel file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder='{\n  "recommended_filename": "Report",\n  "document": { ... }\n}'
                className="min-h-[300px] font-mono text-sm"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <Button size="lg" variant="secondary" className="w-full" disabled={!jsonInput || isProcessing} onClick={() => toast.info("Manual generation will be wired up next!")}>
                <FileText className="mr-2 h-4 w-4" /> Generate Excel from JSON
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}