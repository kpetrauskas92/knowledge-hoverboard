import React, { useState, useEffect, useRef } from 'react';
import { NotebookPen, Lock, LockOpen, Trash2, Copy, Check } from 'lucide-react';
import { HoverButton } from './HoverButton';

export const Notepad: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [text, setText] = useState('');
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isLocked) return;
    
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 800);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const clearNotes = () => {
    setText('');
  };
  
  const copyNotes = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`fixed bottom-0 right-4 sm:right-8 z-50 transition-transform duration-300 ease-out flex flex-col items-end ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tab Handle */}
      <div className={`
        bg-slate-800 text-white px-6 py-2 rounded-t-xl cursor-pointer shadow-lg flex items-center gap-2 border-t border-x border-slate-700
        ${isLocked ? 'bg-indigo-900 border-indigo-700' : ''}
      `}>
        <NotebookPen size={16} />
        <span className="font-semibold text-sm tracking-wide">
          {isLocked ? 'Notes (Pinned)' : 'Notes'}
        </span>
      </div>

      {/* Board Area */}
      <div className="bg-white border-x border-t border-slate-200 w-72 sm:w-96 h-80 shadow-2xl rounded-t-lg relative flex flex-col">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
             <HoverButton 
              label={isLocked ? "Unlock" : "Lock"}
              isActive={isLocked}
              onTrigger={toggleLock}
              className={`p-1.5 rounded border ${isLocked ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200'}`}
              progressColor={isLocked ? 'bg-indigo-200' : 'bg-slate-200'}
            >
              {isLocked ? <Lock size={14} /> : <LockOpen size={14} />}
            </HoverButton>
          </div>
          
          <div className="flex items-center gap-2">
             <HoverButton 
              label={copied ? "Copied" : "Copy"}
              isActive={false}
              onTrigger={copyNotes}
              className="p-1.5 rounded border bg-white text-slate-500 border-slate-200 hover:text-indigo-600"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </HoverButton>
            
            <HoverButton 
              label="Clear"
              isActive={false}
              onTrigger={clearNotes}
              className="p-1.5 rounded border bg-white text-slate-500 border-slate-200 hover:text-red-600"
              progressColor="bg-red-100"
            >
              <Trash2 size={14} />
            </HoverButton>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          className="flex-grow w-full p-4 resize-none focus:outline-none text-slate-700 text-sm leading-relaxed bg-white"
          placeholder="Type your notes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
        
        {/* Footer status */}
        <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-right">
          {text.length} chars
        </div>
      </div>
    </div>
  );
};