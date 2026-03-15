"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  CloudUpload, File, Trash2, Sparkles, 
  Settings2, Key, FileJson, FileText,
  ShieldCheck, Info, Zap, Copy, CheckCircle2, FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/lib/apiClient"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
  const api = useApiClient(); 

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // --- SUCCESS HUB STATE ---
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Clean up polling intervals if user navigates away mid-extraction
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

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

  // --- ACTIONS ---
  const handleNewScan = () => {
    setFile(null);
    setExtractionComplete(false);
    setCompletedTaskId("");
    setRawJson("");
    setShowJson(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
    setIsCopied(true);
    toast.success("JSON copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadExcel = async () => {
    try {
      toast.loading("Preparing Excel file...", { id: "download" });
      const downloadRes = await api.get(`/extract/download/${completedTaskId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([downloadRes.data]));
      const link = document.createElement("a");
      link.href = url;
      
      let filename = `HindiScan_Report_${completedTaskId.substring(0,6)}.xlsx`;
      const disposition = downloadRes.headers["content-disposition"];
      if (disposition && disposition.includes("attachment")) {
        const matches = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i.exec(disposition);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        }
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel file downloaded!", { id: "download" });
    } catch {
      toast.error("Failed to download Excel file.", { id: "download" });
    }
  };

  // --- REAL-TIME ASYNC EXTRACTION SYSTEM ---
  const handleAutoExtract = async () => {
    if (!file) return toast.error("Please upload a document first.");
    if (useCustomKey && !customApiKey) return toast.error("Please enter your Gemini API Key.");

    setIsProcessing(true);
    setUploadProgress(0);
    setAiProgress(0);
    setStatusMessage("Encrypting and uploading to secure vault...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("extract_tables_only", extractTablesOnly.toString());
      formData.append("use_legacy_font", useLegacyFont.toString());
      formData.append("legacy_font_name", legacyFontName);
      
      if (useCustomKey && customApiKey) {
        formData.append("custom_api_key", customApiKey);
      }

      const startRes = await api.post("/extract/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      const taskId = startRes.data.task_id;
      setStatusMessage("AI Initializing...");

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await api.get(`/extract/status/${taskId}`);
          const { status, progress, message } = statusRes.data;
          
          setAiProgress(progress);
          setStatusMessage(message);

          if (status === "completed") {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            setCompletedTaskId(taskId);
            
            // Proactively fetch the JSON payload
            try {
              const jsonRes = await api.get(`/extract/json/${taskId}`);
              setRawJson(JSON.stringify(jsonRes.data, null, 2));
            } catch {
              setRawJson(JSON.stringify({ error: "JSON data could not be retrieved from the server." }, null, 2));
            }

            setExtractionComplete(true);
            setIsProcessing(false);
            window.dispatchEvent(new Event("refreshCredits"));
            toast.success("Extraction completed successfully!");

          } else if (status === "failed") {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            toast.error(`Extraction failed: ${message}`);
            setIsProcessing(false);
          }
        } catch (pollError) {
          console.error("Polling error", pollError);
        }
      }, 1500); 

    } catch (error) {
      console.error("Upload error:", error);
      const err = error as { response?: { status?: number; data?: { detail?: string } } };
      //const errorMessage = error.response?.data?.detail || "An unexpected error occurred during upload.";
      toast.error(`Start failed: ${err}`);
      setIsProcessing(false);
    }
  };

  // --- REAL FASTAPI SUBMISSION (Manual JSON) ---
  const handleManualJson = async () => {
    if (!jsonInput.trim()) return toast.error("Please paste your JSON payload first.");

    setIsProcessing(true);
    setUploadProgress(100);
    setAiProgress(30);
    setStatusMessage("Compiling JSON to Excel...");

    try {
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonInput);
      } catch {
        throw new Error("Invalid JSON format. Please check your syntax.");
      }

      setAiProgress(60);

      const response = await api.post("/extract/manual/", {
        payload: parsedJson,
        use_legacy_font: useLegacyFont,
        legacy_font_name: legacyFontName
      }, {
        responseType: "blob",
      });

      setAiProgress(100);
      setStatusMessage("Download complete!");

      // 🚀 THE FIX: Extract the smart filename from the exposed CORS header
      const disposition = response.headers['content-disposition'];
      let filename = "Manual_HindiScan_Report.xlsx"; // Fallback safety net

      if (disposition && disposition.includes("filename*=utf-8''")) {
        // Parses: attachment; filename*=utf-8''Rajshree_Yojana_Tracking_Tables.xlsx
        filename = decodeURIComponent(disposition.split("filename*=utf-8''")[1]);
      } else if (disposition && disposition.includes('filename=')) {
        // Parses older format: attachment; filename="Rajshree.xlsx"
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // 🚀 Inject the dynamic filename here!
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Prevent memory leaks in the browser by revoking the blob URL
      window.URL.revokeObjectURL(url);

      toast.success("Excel report generated from JSON successfully!");
    } catch (error) {
      console.error("Manual JSON error:", error);
      
      const err = error as { message?: string; response?: { data?: { detail?: string } | Blob } };
      let errorMessage = err.message || "An unexpected error occurred.";
      
      if (err.response?.data instanceof Blob) {
        try {
          const errorText = await err.response.data.text();
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch {
          console.error("Failed to parse blob error");
        }
      } else {
        errorMessage = err.response?.data?.detail || errorMessage;
      }

      toast.error(`Generation failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col min-h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">New Extraction</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Upload your Hindi documents and let AI structure them into perfect Excel spreadsheets.
        </p>
      </div>

      {extractionComplete ? (
        /* 🚀 THE NEW SUCCESS HUB */
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <Card className="border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-6">
              <div className="rounded-full bg-green-100 p-5 dark:bg-green-900/50 ring-8 ring-green-50 dark:ring-green-900/20">
                <Zap className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Extraction Complete!</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Your document has been successfully processed. Choose your export format below.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-2">
                <Button onClick={handleDownloadExcel} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md">
                  <FileSpreadsheet className="mr-2 h-5 w-5" /> Download Excel
                </Button>
                <Button onClick={() => setShowJson(!showJson)} variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/50">
                  <FileJson className="mr-2 h-5 w-5" /> {showJson ? "Hide JSON" : "View Raw JSON"}
                </Button>
              </div>

              <Button onClick={handleNewScan} variant="ghost" className="w-full max-w-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-50">
                <Sparkles className="mr-2 h-4 w-4" /> Scan Another Document
              </Button>
            </CardContent>
          </Card>

          {/* 🚀 TOGGLEABLE JSON VIEWER */}
          {showJson && (
            <Card className="animate-in slide-in-from-top-4 border-slate-200 dark:border-slate-800 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl border-b dark:border-slate-800">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-amber-500" /> Raw JSON Output
                </CardTitle>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8">
                  {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {isCopied ? "Copied!" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="max-h-[400px] overflow-auto bg-slate-950 p-6 text-xs text-green-400 font-mono leading-relaxed rounded-b-xl">
                  {rawJson}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* STANDARD UI: TABS, DRAG/DROP, AND SETTINGS */
        <Tabs defaultValue="auto" className="w-full flex-1">
          <TabsList className="grid w-full max-w-xl grid-cols-2 h-14 p-1">
            <TabsTrigger value="auto" className="flex items-center justify-center gap-2 h-full data-[state=active]:shadow-md transition-all">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-500 shrink-0" /> 
                <span className="font-semibold text-sm md:text-base leading-none translate-y-[1px]">AI Auto-Extract</span>
              </div>
              <div className="hidden md:flex h-5 items-center justify-center rounded-full bg-blue-100 px-2 text-[9px] font-bold tracking-wider text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                <span className="translate-y-[1px]">(RECOMMENDED)</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center justify-center gap-2 h-full data-[state=active]:shadow-md transition-all">
              <FileJson className="h-4 w-4 shrink-0" /> 
              <span className="font-semibold text-sm md:text-base leading-none translate-y-[1px]">Manual JSON</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AI AUTO-EXTRACT */}
          <TabsContent value="auto" className="mt-6 space-y-6">
            
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
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0" disabled={isProcessing}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4" /> Extraction Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tables-only" className="flex flex-col items-start space-y-1 text-left">
                      <span>Extract Tables Only</span>
                      <span className="font-normal text-xs text-slate-500">Ignores paragraphs & headers</span>
                    </Label>
                    <Switch id="tables-only" checked={extractTablesOnly} onCheckedChange={setExtractTablesOnly} disabled={isProcessing} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="legacy-font" className="flex flex-col items-start space-y-1 text-left">
                      <span>Enable Legacy Fonts</span>
                      <span className="font-normal text-xs text-slate-500">Apply Kruti Dev / DevLys</span>
                    </Label>
                    <Switch id="legacy-font" checked={useLegacyFont} onCheckedChange={setUseLegacyFont} disabled={isProcessing} />
                  </div>

                  {useLegacyFont && (
                    <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                      <Select value={legacyFontName} onValueChange={setLegacyFontName} disabled={isProcessing}>
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

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><Key className="h-4 w-4" /> API Key Override</CardTitle>
                  <CardDescription className="text-xs">Bypass your 3 free credits by using your own Google Gemini API key.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="custom-key-toggle" className="flex flex-col items-start space-y-1 text-left">
                      <span>Use Custom API Key</span>
                    </Label>
                    <Switch id="custom-key-toggle" checked={useCustomKey} onCheckedChange={setUseCustomKey} disabled={isProcessing} />
                  </div>
                  {useCustomKey && (
                    <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                      <input 
                        type="password" 
                        placeholder="Paste Gemini API Key..." 
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 disabled:opacity-50"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        disabled={isProcessing}
                      />
                      <p className="mt-2 text-xs text-slate-500 text-left">Zero-Trust: Your key never leaves browser memory.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-400">Privacy & Security</h4>
                  <p className="mt-1 text-xs text-green-700 dark:text-green-500/80">
                    Your file is processed securely in temporary memory and is <b>instantly deleted</b> from our servers the moment your extraction is generated. We do not store your documents.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-500" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400">AI Confidence</h4>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-500/80">
                    This system uses advanced Vision AI to process complex layouts. While highly accurate, poor image lighting or illegible handwriting may occasionally affect the output.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {isProcessing && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 rounded-lg border bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>Network Upload</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm font-semibold text-blue-700 dark:text-blue-400">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        {statusMessage}
                      </span>
                      <span>{aiProgress}%</span>
                    </div>
                    <Progress value={aiProgress} className="h-2.5" />
                  </div>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full text-base font-semibold shadow-lg transition-all hover:scale-[1.01]"
                disabled={!file || isProcessing}
                onClick={handleAutoExtract}
              >
                {isProcessing ? "Processing Document..." : "✨ Auto-Extract & Build Excel"}
              </Button>
            </div>

          </TabsContent>

          {/* TAB 2: MANUAL JSON */}
          <TabsContent value="manual" className="mt-6 space-y-6 animate-in fade-in duration-500">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10 text-left">
              <h4 className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-500">
                <Info className="h-5 w-5" /> How to use this manual tool
              </h4>
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-500/80">
                Go to an AI like ChatGPT or Gemini, upload your document, and ask it to extract the data using the exact JSON Schema format below. Once the AI generates the JSON, paste it into the box to compile your Excel file.
              </p>
              <details className="group mt-4 cursor-pointer">
                <summary className="text-sm font-medium text-amber-700 outline-none hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">
                  👉 Click to View Expected JSON Structure
                </summary>
                <pre className="mt-3 overflow-x-auto rounded-md bg-slate-900 p-4 text-xs text-slate-50 dark:bg-slate-950">
{`{
  "recommended_filename": "Short_Descriptive_Name",
  "document": {
    "main_title": {
      "text": "Extracted main title here",
      "is_bold": true,
      "font_size": 14
    },
    "subtitles": [],
    "tables": [
      {
        "table_id": 1,
        "table_title": "",
        "headers": [{"column_name": "Header 1", "is_bold": true}],
        "rows": [["Row 1 Col 1 Value"]]
      }
    ],
    "footer": {"text": "", "is_bold": false, "font_size": 11}
  }
}`}
                </pre>
              </details>
            </div>

            <Card>
              <CardHeader className="text-left">
                <CardTitle>JSON Payload</CardTitle>
                <CardDescription>
                  Paste your structured JSON payload below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder={`{\n  "recommended_filename": "Report_Name",\n  "document": {\n    "main_title": { "text": "..." }\n  }\n}`}
                  className="min-h-[300px] font-mono text-sm disabled:opacity-50"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  disabled={isProcessing}
                />
                <Button size="lg" variant="secondary" className="w-full" disabled={!jsonInput || isProcessing} onClick={handleManualJson}>
                  <FileText className="mr-2 h-4 w-4" /> Generate Excel from JSON
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t pt-6 pb-2 text-center text-sm text-slate-500 dark:text-slate-400">
        Made with ❤️ by Divesh | Powered by Gemini VLM Architecture
      </footer>

    </div>
  );
}