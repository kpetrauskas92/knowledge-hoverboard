
import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Check, NotebookPen } from 'lucide-react';
import { HoverButton } from './HoverButton';

export const StaticNotepad: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('qa-board-notes');
    if (saved) setText(saved);
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('qa-board-notes', text);
  }, [text]);

  const copyNotes = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearNotes = () => {
    setText('');
  };

  return (
    <div className="mt-16 border-t border-slate-200 pt-8 animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <NotebookPen size={20} />
            <span>Interview Notes</span>
          </div>
          
          <div className="flex items-center gap-3">
             <HoverButton 
              label={copied ? "Copied" : "Copy"}
              isActive={false}
              onTrigger={copyNotes}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-medium text-slate-600 shadow-sm"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </HoverButton>
            
            <HoverButton 
              label="Clear"
              isActive={false}
              onTrigger={clearNotes}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded text-xs font-medium text-red-600 shadow-sm"
              progressColor="bg-red-100"
            >
              <Trash2 size={14} />
            </HoverButton>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          className="w-full h-64 p-6 resize-y focus:outline-none focus:bg-slate-50/50 text-slate-700 leading-relaxed text-base transition-colors"
          placeholder="Type your notes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
        
        {/* Footer Status */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-right">
          Saved automatically • {text.length} characters
        </div>
      </div>
    </div>
  );
};
