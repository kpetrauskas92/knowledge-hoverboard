
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MessageCircleQuestion, AlertCircle, CheckCircle2, Sparkles, RotateCcw, Plus, X } from 'lucide-react';
import { QACard } from './components/QACard';
import { FileUpload } from './components/FileUpload';
import { HoverButton } from './components/HoverButton';
import { StaticNotepad } from './components/StaticNotepad';
import { DEFAULT_QA_ITEMS } from './constants';
import { QAItem } from './types';
import { getTopKeywords } from './utils';

function App() {
  const [items, setItems] = useState<QAItem[]>(DEFAULT_QA_ITEMS);
  const [openIds, setOpenIds] = useState<Set<string | number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Filtering State
  const [activeKeyword, setActiveKeyword] = useState<string>('');
  
  // Custom Keywords State
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [hiddenKeywords, setHiddenKeywords] = useState<Set<string>>(new Set());
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // Refresh Key for animation on upload
  const [refreshKey, setRefreshKey] = useState(0);

  // Column calculation for stable masonry layout
  const [columnsCount, setColumnsCount] = useState(1);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1536) setColumnsCount(3); // 2xl (XXL screens)
      else if (width >= 768) setColumnsCount(2); // md to xl
      else setColumnsCount(1); // sm
    };
    
    // Initial call
    updateColumns();
    
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Extract top keywords + custom keywords - hidden keywords
  const keywords = useMemo(() => {
    const auto = getTopKeywords(items);
    const combined = [...auto, ...customKeywords];
    // Deduplicate
    const unique = Array.from(new Set(combined));
    // Filter out hidden
    return unique.filter(k => !hiddenKeywords.has(k));
  }, [items, customKeywords, hiddenKeywords]);

  // Filter items based on Keyword only
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesKeyword = activeKeyword === '' || item.question.toLowerCase().includes(activeKeyword.toLowerCase());
      return matchesKeyword;
    });
  }, [items, activeKeyword]);

  // Distribute items into columns for stable rendering
  const columns = useMemo(() => {
    const cols: QAItem[][] = Array.from({ length: columnsCount }, () => []);
    filteredItems.forEach((item, index) => {
      cols[index % columnsCount].push(item);
    });
    return cols;
  }, [filteredItems, columnsCount]);

  const handleToggle = useCallback((id: string | number, isOpen: boolean) => {
    setOpenIds(prev => {
      const currentOpenId = Array.from(prev)[0];
      
      if (isOpen) {
        // Opening a card: clear everything else and open this one
        return new Set([id]);
      } else {
        // Closing a card:
        // CRITICAL FIX: Only allow closing if the card requesting to close
        // is actually the one that is currently open.
        if (currentOpenId === id) {
          return new Set();
        }
        // If ids don't match, it means the user has already moved on to another card,
        // so we ignore this stale close request.
        return prev;
      }
    });
  }, []);

  const handleUploadSuccess = (newItems: QAItem[], uploadedKeywords?: string[]) => {
    setItems(newItems);
    setOpenIds(new Set()); 
    setActiveKeyword('');
    
    // If keywords provided in file, use them, otherwise reset
    setCustomKeywords(uploadedKeywords || []);
    
    setHiddenKeywords(new Set()); // Reset hidden keywords
    setError(null);
    setSuccessMsg(`Successfully loaded ${newItems.length} questions.`);
    setRefreshKey(prev => prev + 1); // Trigger refresh animation
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUploadError = (msg: string) => {
    setError(msg);
    setSuccessMsg(null);
  };

  // Handlers
  const triggerKeyword = (word: string) => setActiveKeyword(word);
  const triggerReset = () => {
    setActiveKeyword('');
  };
  
  const handleAddKeyword = () => {
    const val = newKeywordInput.trim();
    if (!val) return;

    // If it was hidden, unhide it
    if (hiddenKeywords.has(val)) {
      setHiddenKeywords(prev => {
        const next = new Set(prev);
        next.delete(val);
        return next;
      });
    }

    // Add to custom if not already present
    setCustomKeywords(prev => prev.includes(val) ? prev : [...prev, val]);
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (word: string) => {
    setHiddenKeywords(prev => new Set(prev).add(word));
    if (activeKeyword === word) {
      setActiveKeyword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative pb-8">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MessageCircleQuestion className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">
              Knowledge Board
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <FileUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
          </div>
        </div>
      </header>

      {/* Controls Area - Sticky below header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-16 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          
          {/* Keyword Cloud */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pb-1 min-h-[40px]">
            <div className="flex items-center gap-2 text-slate-400 flex-shrink-0 sm:pt-1.5">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Keywords</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Existing & Custom Keywords */}
              {keywords.map(word => {
                const isActive = activeKeyword === word;
                return (
                  <div key={word} className="relative group/kw flex-shrink-0">
                    <HoverButton
                      isActive={isActive}
                      onTrigger={() => triggerKeyword(word)}
                      progressColor="bg-slate-300"
                      className={`
                        whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 border
                        ${isActive
                          ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200'
                        }
                      `}
                      label={`#${word}`}
                    />
                    
                    {/* Remove Button (Visible on Hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveKeyword(word);
                      }}
                      className="absolute -top-2 -right-1 z-20 hidden group-hover/kw:flex items-center justify-center w-4 h-4 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-full shadow-sm transition-all"
                      title="Remove keyword"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
              
              {/* Add New Keyword Input */}
              <div className="flex items-center h-7 bg-slate-50 border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="Add keyword..."
                  className="w-24 px-2 py-1 text-xs bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 placeholder:text-slate-400"
                />
                <button
                  onClick={handleAddKeyword}
                  disabled={!newKeywordInput.trim()}
                  className="h-full px-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-l border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add keyword"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Clear Filters Button */}
              {(activeKeyword !== '') && (
                <HoverButton
                  isActive={false}
                  onTrigger={triggerReset}
                  progressColor="bg-red-200"
                  className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-1 flex-shrink-0"
                  label={<><RotateCcw size={12} /> RESET</>}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Status Banners */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 animate-fade-in">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium">Error loading content</h4>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
            <HoverButton 
               label="Dismiss" 
               isActive={false}
               onTrigger={() => setError(null)}
               className="ml-auto text-xs underline hover:no-underline"
            />
          </div>
        )}

        {successMsg && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700 animate-fade-in">
            <CheckCircle2 className="flex-shrink-0" size={20} />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Columns - Added key for refresh animation */}
        <div key={refreshKey} className="flex flex-row items-start justify-center gap-6 animate-fade-in">
          {columns.map((colItems, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col gap-6 min-w-0">
              {colItems.map((item) => (
                <QACard
                  key={item.id}
                  item={item}
                  isOpen={openIds.has(item.id)}
                  onToggle={handleToggle}
                  highlightKeyword={activeKeyword}
                  detectedKeywords={keywords}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-slate-100 inline-flex p-4 rounded-full mb-4">
              <MessageCircleQuestion className="text-slate-400" size={48} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No questions match your filters</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">
              Try hovering over the "RESET" button or clearing your keywords.
            </p>
            <div className="flex justify-center">
               <HoverButton
                 label="Reset All Filters"
                 isActive={false}
                 onTrigger={triggerReset}
                 className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-200"
                 progressColor="bg-indigo-800"
               />
            </div>
          </div>
        )}

        {/* Static Notepad Area - Placed at bottom of main content */}
        <StaticNotepad />
      </main>
    </div>
  );
}

export default App;
