import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import './index.css';

// --- Icons (SVG) ---
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

// --- Types ---
interface Wine {
  id: string;
  imageUrl: string | null;
  region: string;
  winery: string;
  name: string;
  vintage: string;
  type: string;
  status: 'bought' | 'wishlist';
  purchaseDate: string;
  price: number | '';
  userNotes: string;
  aiFlavor: string;
  aiVintageComparison: string;
  createdAt: number;
}

// --- Main App Component ---
const App = () => {
  const [view, setView] = useState<'list' | 'scan' | 'edit' | 'settings'>('list');
  const [wines, setWines] = useState<Wine[]>(() => {
    try {
      const saved = localStorage.getItem('my-wines');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load wines", e);
      return [];
    }
  });
  const [currentWine, setCurrentWine] = useState<Wine | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Persist to local storage (simulating cloud sync)
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem('my-wines', JSON.stringify(wines));
      setIsSaving(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [wines]);

  const handleSaveWine = (wine: Wine) => {
    setWines(prev => {
      const existing = prev.findIndex(w => w.id === wine.id);
      if (existing >= 0) {
        const newWines = [...prev];
        newWines[existing] = wine;
        return newWines;
      }
      return [wine, ...prev];
    });
    setView('list');
  };

  const handleDeleteWine = (id: string) => {
    if (confirm('Are you sure you want to delete this wine?')) {
      setWines(prev => prev.filter(w => w.id !== id));
      setView('list');
    }
  };

  const handleImportWines = (importedWines: Wine[]) => {
    if (confirm(`Found ${importedWines.length} wines. This will merge with your current list. Continue?`)) {
      // Merge logic: add if ID doesn't exist
      setWines(prev => {
        const newWines = [...prev];
        importedWines.forEach(imported => {
          if (!newWines.some(w => w.id === imported.id)) {
            newWines.push(imported);
          }
        });
        return newWines;
      });
      alert("Import successful!");
      setView('list');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative overflow-hidden max-w-md mx-auto shadow-2xl border-x border-gray-200">
      {/* Cloud Status Bar */}
      <div className="absolute top-0 right-0 p-2 z-50 flex items-center gap-1 text-xs font-medium text-gray-500 bg-white/80 backdrop-blur-sm rounded-bl-lg shadow-sm">
        {isSaving ? (
          <><span className="animate-pulse">Syncing...</span><CloudIcon /></>
        ) : (
          <><span>Saved</span><CheckIcon /></>
        )}
      </div>

      {view === 'list' && (
        <WineList 
          wines={wines} 
          onScan={() => setView('scan')} 
          onSelect={(wine) => { setCurrentWine(wine); setView('edit'); }}
          onOpenSettings={() => setView('settings')}
        />
      )}

      {view === 'scan' && (
        <Scanner 
          onCancel={() => setView('list')}
          onAnalyzed={(wine) => { setCurrentWine(wine); setView('edit'); }}
        />
      )}

      {view === 'edit' && currentWine && (
        <Editor 
          wine={currentWine} 
          onSave={handleSaveWine}
          onCancel={() => setView('list')}
          onDelete={() => handleDeleteWine(currentWine.id)}
        />
      )}

      {view === 'settings' && (
        <Settings 
          wines={wines}
          onBack={() => setView('list')}
          onImport={handleImportWines}
        />
      )}
    </div>
  );
};

// --- List Component ---
const WineList = ({ wines, onScan, onSelect, onOpenSettings }: { wines: Wine[], onScan: () => void, onSelect: (w: Wine) => void, onOpenSettings: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const wineTypes = ['All', 'Red', 'White', 'Rose', 'Sparkling', 'Orange', 'Dessert'];

  const filteredWines = wines.filter(wine => {
    const matchesSearch = (wine.name + wine.winery + wine.region).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || wine.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white pt-12 pb-4 px-6 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
             <h1 className="text-3xl font-serif font-bold text-wine-900">My Cellar</h1>
             <p className="text-gray-500 text-sm mt-1">Track your wine journey</p>
          </div>
          <button onClick={onOpenSettings} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <CogIcon />
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-wine-500 transition-all" 
            placeholder="Search winery, region, or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Tags */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
          {wineTypes.map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === type 
                  ? 'bg-wine-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {filteredWines.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No wines found.</p>
            <p className="text-sm mt-2">Scan a bottle to get started!</p>
          </div>
        ) : (
          filteredWines.map(wine => (
            <div 
              key={wine.id} 
              onClick={() => onSelect(wine)}
              className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                {wine.imageUrl ? (
                  <img src={wine.imageUrl} alt="Wine Label" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="text-xs">No Img</span>
                  </div>
                )}
                <div className={`absolute top-0 left-0 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
                  wine.type.toLowerCase().includes('red') ? 'bg-red-800' :
                  wine.type.toLowerCase().includes('white') ? 'bg-yellow-600' :
                  wine.type.toLowerCase().includes('rose') ? 'bg-pink-500' :
                  'bg-gray-600'
                }`}>
                  {wine.type}
                </div>
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-gray-900 truncate pr-2">{wine.winery}</h3>
                  {wine.price && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">${wine.price}</span>}
                </div>
                <p className="text-sm text-gray-600 truncate">{wine.name}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700 font-medium">{wine.vintage}</span>
                  <span className="truncate max-w-[8rem]">{wine.region}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                   {wine.status === 'wishlist' ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        Wishlist
                      </span>
                   ) : (
                      <span className="text-[10px] font-bold text-wine-700 bg-wine-50 border border-wine-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        Purchased
                      </span>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* FAB */}
      <button 
        onClick={onScan}
        className="fixed bottom-6 right-6 w-16 h-16 bg-wine-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-wine-800 active:scale-95 transition-all z-20"
      >
        <CameraIcon />
      </button>
    </div>
  );
};

// --- Settings Component (Import/Export) ---
const Settings = ({ wines, onBack, onImport }: { wines: Wine[], onBack: () => void, onImport: (w: Wine[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(wines, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wine-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    // Define CSV Headers
    const headers = ["ID", "Winery", "Name", "Vintage", "Region", "Type", "Status", "Price", "PurchaseDate", "UserNotes", "FlavorProfile", "VintageNotes"];
    
    // Convert wines to CSV rows
    const rows = wines.map(w => [
      w.id,
      `"${w.winery.replace(/"/g, '""')}"`, // Escape quotes
      `"${w.name.replace(/"/g, '""')}"`,
      w.vintage,
      `"${w.region.replace(/"/g, '""')}"`,
      w.type,
      w.status,
      w.price,
      w.purchaseDate,
      `"${w.userNotes.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${w.aiFlavor.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${w.aiVintageComparison.replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wine-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (Array.isArray(json)) {
          onImport(json);
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error parsing file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeftIcon />
        </button>
        <span className="font-semibold text-gray-900">Data Management</span>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <h2 className="font-serif font-bold text-xl text-wine-900">Cloud Sync (Manual)</h2>
          <p className="text-sm text-gray-500">Your data is currently stored on this device. Use these options to backup to your cloud drive (Google Drive, iCloud) or export to a spreadsheet.</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl text-green-800 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-green-600"><DownloadIcon /></div>
              <div className="text-left">
                <div className="font-bold text-sm">Export to Spreadsheet</div>
                <div className="text-xs opacity-80">Save as .csv for Google Sheets/Excel</div>
              </div>
            </div>
            <ChevronLeftIcon /> {/* Reusing icon rotated for right arrow look if needed, but keeping simple */}
          </button>

          <button 
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-gray-600"><CloudIcon /></div>
              <div className="text-left">
                <div className="font-bold text-sm">Backup Full Data</div>
                <div className="text-xs opacity-80">Save JSON backup (Images included)</div>
              </div>
            </div>
          </button>

          <div className="relative">
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-blue-600"><UploadIcon /></div>
                <div className="text-left">
                  <div className="font-bold text-sm">Restore Backup</div>
                  <div className="text-xs opacity-80">Import a previously saved JSON file</div>
                </div>
              </div>
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <h3 className="text-yellow-800 font-bold text-xs uppercase tracking-wide mb-2">How to save to Cloud?</h3>
          <ul className="text-sm text-yellow-900 space-y-2 list-disc pl-4">
            <li>Click <strong>Export to Spreadsheet</strong>.</li>
            <li>When prompted by your phone, choose <strong>"Save to Files"</strong> (iOS) or <strong>"Save to Drive"</strong> (Android).</li>
            <li>Open Google Sheets and import the CSV file to view your cellar.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Scanner Component (The AI Magic) ---
const Scanner = ({ onCancel, onAnalyzed }: { onCancel: () => void, onAnalyzed: (wine: Wine) => void }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    // 1. Check API Key with robust check
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
        setError("API Key is missing! Go to Vercel Dashboard -> Project Settings -> Environment Variables and set 'API_KEY'.");
        setIsAnalyzing(false);
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];

        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        const prompt = `
        Analyze this wine label image. Return a JSON object with these keys:
        - region (string): e.g., "Napa Valley", "Bordeaux".
        - winery (string): The producer name.
        - name (string): The specific wine name/cuvee.
        - vintage (string): Year or "NV".
        - type (string): Red, White, Rose, Sparkling, Champagne, Orange, Dessert, Fortified, Other. Guess based on label style if not explicit.
        
        If uncertain, use null.
        `;

        // Add timeout wrapper to prevent infinite spinning
        const apiCall = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: {
            parts: [
              { inlineData: { mimeType: file.type, data: base64Data } },
              { text: prompt }
            ]
          },
          config: {
            systemInstruction: "You are an expert sommelier assistant. Extract wine label data accurately.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                region: { type: Type.STRING },
                winery: { type: Type.STRING },
                name: { type: Type.STRING },
                vintage: { type: Type.STRING },
                type: { type: Type.STRING },
              }
            }
          }
        });

        // 15 second timeout
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 15000)
        );

        const result: any = await Promise.race([apiCall, timeout]);

        // 3. Defensively parse JSON (strip markdown if present)
        let text = result.text || "{}";
        if (text.startsWith('```')) {
             text = text.replace(/^```json\s*/, '').replace(/```$/, '');
        }
        const data = JSON.parse(text);

        const newWine: Wine = {
          id: Date.now().toString(),
          imageUrl: base64String,
          region: data.region || '',
          winery: data.winery || '',
          name: data.name || '',
          vintage: data.vintage || 'NV',
          type: data.type || 'Red',
          status: 'bought',
          purchaseDate: new Date().toISOString().split('T')[0],
          price: '',
          userNotes: '',
          aiFlavor: '',
          aiVintageComparison: '',
          createdAt: Date.now()
        };

        onAnalyzed(newWine);
      } catch (err: any) {
        console.error("Analysis Error:", err);
        let msg = 'Could not analyze image.';
        if (err.message?.includes('timed out')) msg = "Request timed out. Check internet.";
        if (err.message?.includes('403') || err.toString().includes('403')) msg += ' (API Key Invalid or Quota Exceeded)';
        if (err.message?.includes('429') || err.toString().includes('429')) msg += ' (Quota Exceeded)';
        if (err.message?.includes('400') || err.toString().includes('400')) msg += ' (Bad Request - Image too large?)';
        setError(msg);
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.onerror = () => {
        setError("Failed to read file.");
        setIsAnalyzing(false);
    };
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center relative p-6">
      <button onClick={onCancel} className="absolute top-6 right-6 text-white p-2 bg-white/20 rounded-full backdrop-blur-md">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="w-full max-w-xs text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-white">Scan Label</h2>
          <p className="text-gray-300">Capture the bottle label to auto-detect details.</p>
        </div>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-16 h-16 border-4 border-wine-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-wine-200 animate-pulse font-medium">Analyzing Vintage...</p>
          </div>
        ) : (
          <div className="space-y-4">
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <CameraIcon /> Take Photo
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            {error && <div className="text-red-200 bg-red-900/50 p-4 rounded-xl text-sm border border-red-500/50">
              <p className="font-bold mb-1">Error</p>
              <p>{error}</p>
            </div>}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Editor Component ---
const Editor = ({ wine, onSave, onCancel, onDelete }: { wine: Wine, onSave: (w: Wine) => void, onCancel: () => void, onDelete: () => void }) => {
  const [formData, setFormData] = useState<Wine>(wine);
  const [isEnriching, setIsEnriching] = useState(false);

  // Auto-enrich if new wine and empty AI fields
  useEffect(() => {
    if (!wine.aiFlavor && !isEnriching && wine.winery && wine.name) {
      enrichWineData();
    }
  }, []);

  const enrichWineData = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") return; // Skip if no key
    
    setIsEnriching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const query = `Find tasting notes, flavor profile, and vintage comparison for ${formData.vintage} ${formData.winery} ${formData.name} wine.`;
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: query }],
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const searchResponse = result.text;
      
      const formatPrompt = `
        Based on this wine information:
        "${searchResponse}"

        Return a JSON with:
        - flavor (short summary of tasting notes)
        - vintageComparison (how this vintage compares to others, or general vintage info for that region)
      `;
      
      const formatResult = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: formatPrompt }],
        config: { responseMimeType: "application/json" }
      });
      
      const aiData = JSON.parse(formatResult.text || "{}");

      setFormData(prev => ({
        ...prev,
        aiFlavor: aiData.flavor || "No specific details found.",
        aiVintageComparison: aiData.vintageComparison || "No vintage comparison available."
      }));

    } catch (e) {
      console.error("Enrichment failed", e);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleChange = (field: keyof Wine, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Nav */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeftIcon />
        </button>
        <span className="font-semibold text-gray-900">Edit Wine Details</span>
        <button onClick={() => onSave(formData)} className="text-wine-600 font-bold text-sm px-2 py-1">
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-24">
        
        {/* Image & Basic Info */}
        <div className="flex gap-5">
          <div className="w-32 h-40 bg-gray-100 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
            {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Winery</label>
              <input 
                type="text" 
                value={formData.winery} 
                onChange={e => handleChange('winery', e.target.value)}
                className="w-full border-b border-gray-200 py-1 font-serif font-bold text-lg focus:border-wine-500 outline-none bg-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Wine Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => handleChange('name', e.target.value)}
                className="w-full border-b border-gray-200 py-1 text-gray-800 focus:border-wine-500 outline-none bg-transparent"
              />
            </div>
            <div className="flex gap-3">
               <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Vintage</label>
                <input 
                  type="text" 
                  value={formData.vintage} 
                  onChange={e => handleChange('vintage', e.target.value)}
                  className="w-full border-b border-gray-200 py-1 text-gray-800 focus:border-wine-500 outline-none bg-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Region</label>
                <input 
                  type="text" 
                  value={formData.region} 
                  onChange={e => handleChange('region', e.target.value)}
                  className="w-full border-b border-gray-200 py-1 text-gray-800 focus:border-wine-500 outline-none bg-transparent"
                />
              </div>
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
              <select 
                value={formData.type} 
                onChange={e => handleChange('type', e.target.value)}
                className="w-full border-b border-gray-200 py-1 text-gray-800 focus:border-wine-500 outline-none bg-transparent appearance-none"
              >
                {['Red', 'White', 'Rose', 'Sparkling', 'Champagne', 'Orange', 'Dessert', 'Fortified', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Purchase Status */}
        <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
          <div className="flex rounded-lg bg-gray-200 p-1">
            <button 
              onClick={() => handleChange('status', 'bought')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${formData.status === 'bought' ? 'bg-white text-wine-700 shadow-sm' : 'text-gray-500'}`}
            >
              Bought
            </button>
            <button 
              onClick={() => handleChange('status', 'wishlist')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${formData.status === 'wishlist' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}
            >
              Wishlist
            </button>
          </div>

          {formData.status === 'bought' && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
               <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Purchase Date</label>
                <input 
                  type="date" 
                  value={formData.purchaseDate}
                  onChange={e => handleChange('purchaseDate', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-wine-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => handleChange('price', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-wine-200"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
             <h3 className="font-serif font-bold text-lg flex items-center gap-2">
              <span className="text-wine-600"><SparklesIcon /></span> AI Insights
             </h3>
             {isEnriching && <span className="text-xs text-gray-400 animate-pulse">Searching web...</span>}
          </div>
          
          <div className="bg-gradient-to-br from-wine-50 to-white border border-wine-100 rounded-2xl p-4 space-y-4 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-wine-800 uppercase tracking-wide mb-1">Flavor Profile</h4>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                {formData.aiFlavor || (isEnriching ? "Analyzing..." : "No data available.")}
              </p>
            </div>
            <div className="border-t border-wine-100 pt-3">
              <h4 className="text-xs font-bold text-wine-800 uppercase tracking-wide mb-1">Vintage Notes</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {formData.aiVintageComparison || (isEnriching ? "Comparing vintages..." : "No data available.")}
              </p>
            </div>
          </div>
        </div>

        {/* User Notes */}
        <div>
           <h3 className="font-serif font-bold text-lg mb-3">My Tasting Notes</h3>
           <textarea 
             value={formData.userNotes}
             onChange={e => handleChange('userNotes', e.target.value)}
             placeholder="Aroma, taste, pairing ideas..."
             className="w-full h-32 border border-gray-200 rounded-2xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-wine-200 focus:border-wine-500 outline-none resize-none bg-gray-50"
           />
        </div>
        
        <button 
          onClick={onDelete}
          className="w-full py-3 text-red-500 text-sm font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          Delete Wine
        </button>

      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);