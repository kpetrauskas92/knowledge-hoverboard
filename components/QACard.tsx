
import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { QAItem } from '../types';

interface QACardProps {
  item: QAItem;
  isOpen: boolean;
  onToggle: (id: string | number, isOpen: boolean) => void;
  highlightKeyword?: string;
  detectedKeywords?: string[];
}

export const QACard: React.FC<QACardProps> = ({ 
  item, 
  isOpen, 
  onToggle, 
  highlightKeyword,
  detectedKeywords = []
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(0);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Handle the height animation for smooth accordion effect
  useEffect(() => {
    if (isOpen) {
      const scrollHeight = contentRef.current?.scrollHeight || 0;
      setHeight(scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Utility to clear timer
  const clearTimer = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Handlers for interaction
  const handleMouseEnter = () => {
    clearTimer();
    
    // Only toggle if not already open to avoid unnecessary renders
    if (!isOpen) {
      onToggle(item.id, true);
    }
  };

  // Keep-alive: As long as mouse moves inside, we reset the close timer
  const handleMouseMove = () => {
    if (hoverTimeoutRef.current) {
      clearTimer();
    }
  };

  const handleMouseLeave = () => {
    // Add a substantial delay (600ms) before closing.
    // This is "sticky" enough to prevent accidental closures.
    hoverTimeoutRef.current = setTimeout(() => {
      onToggle(item.id, false);
    }, 600);
  };

  const handleClick = () => {
    clearTimer();
    onToggle(item.id, !isOpen);
  };

  // Render text with highlight logic
  const renderHighlightedText = (text: string, active?: string, allDetected?: string[]) => {
    // Collect all terms to highlight
    const terms = new Set<string>();
    
    // Add active keyword if present
    if (active && active.trim()) terms.add(active.trim());
    
    // Add all detected keywords
    if (allDetected) {
      allDetected.forEach(k => {
        if (k && k.trim()) terms.add(k.trim());
      });
    }
    
    if (terms.size === 0) return text;
    
    // Escape special regex characters
    const escapedTerms = Array.from(terms).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Sort by length descending to ensure longest match first (though \b helps)
    escapedTerms.sort((a, b) => b.length - a.length);
    
    // Create regex with word boundaries
    const pattern = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');
    const parts = text.split(pattern);
    
    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      
      // Check exact match for Active Keyword (Primary Highlight)
      const isActive = active && lowerPart === active.toLowerCase();
      
      // Check exact match for Detected Keyword (Secondary Highlight)
      const isDetected = allDetected && allDetected.some(d => d.toLowerCase() === lowerPart);
      
      if (isActive) {
        return (
          <span key={i} className="bg-yellow-300 text-slate-900 font-bold rounded px-1 shadow-sm mx-0.5">
            {part}
          </span>
        );
      } else if (isDetected) {
        // Subtler style: just bold and colored, no background box
        return (
          <span key={i} className="text-indigo-500 font-bold mx-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  return (
    <div
      className={`
        w-full relative overflow-hidden
        bg-white rounded-xl border
        transition-all duration-200 ease-out
        focus-within:ring-2 focus-within:ring-offset-2 focus-within:shadow-lg
        ${isOpen 
          ? 'shadow-2xl border-indigo-500 ring-indigo-500 z-10' 
          : 'border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20'
        }
      `}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="w-full text-left p-5 flex items-start justify-between group focus:outline-none rounded-xl"
        aria-expanded={isOpen}
        aria-controls={`answer-${item.id}`}
      >
        <div className="flex flex-col gap-2 w-full pr-4">
          <h3 
             className={`text-lg font-bold leading-snug transition-colors duration-200 ${isOpen ? 'text-slate-900' : 'text-slate-700 group-hover:text-indigo-700'}`}
          >
            {renderHighlightedText(item.question, highlightKeyword, detectedKeywords)}
          </h3>
        </div>
        
        <span 
          className={`
            mt-1 flex-shrink-0 transition-transform duration-300 
            ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}
          `}
        >
          <ChevronDown size={24} strokeWidth={2.5} />
        </span>
      </button>

      <div
        id={`answer-${item.id}`}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
        style={{ height }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="px-5 pb-6 pt-0">
          <p className="text-slate-600 leading-relaxed text-base border-t pt-4 border-slate-100">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};
