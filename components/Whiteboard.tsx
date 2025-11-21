
import React, { useState, useRef, useEffect } from 'react';
import { Eraser, PenTool } from 'lucide-react';
import { HoverButton } from './HoverButton';

export const Whiteboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Setup Canvas Context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set default styles
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    // Handle resizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Save current content
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx?.drawImage(canvas, 0, 0);

        // Resize
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        // Restore content
        ctx.drawImage(tempCanvas, 0, 0);
        
        // Reset styles after resize (context resets)
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
      }
    };

    window.addEventListener('resize', resizeCanvas);
    // Initial size
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Hover Logic to Open/Close
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Delay closing so user can move mouse comfortably
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsDrawing(false);
    }, 800);
  };

  // Drawing Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ease-out flex flex-col items-center ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tab Handle */}
      <div className="bg-slate-800 text-white px-6 py-2 rounded-t-xl cursor-pointer shadow-lg flex items-center gap-2 border-t border-x border-slate-700">
        <PenTool size={16} />
        <span className="font-semibold text-sm tracking-wide">Scratchpad</span>
      </div>

      {/* Board Area */}
      <div className="bg-white border-x border-t border-slate-200 w-[90vw] max-w-3xl h-64 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] rounded-t-lg relative">
        
        {/* Canvas */}
        <div className="w-full h-full cursor-crosshair touch-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Tools Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <HoverButton 
            label="Clear"
            isActive={false}
            onTrigger={clearBoard}
            className="bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded text-xs font-bold text-red-600"
            progressColor="bg-red-100"
          >
            <Eraser size={14} className="mr-1" />
          </HoverButton>
        </div>

        {/* Helper Text */}
        <div className="absolute bottom-2 left-4 pointer-events-none select-none opacity-30 text-xs">
          Use mouse/touch to draw
        </div>
      </div>
    </div>
  );
};
