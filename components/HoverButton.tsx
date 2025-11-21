import React, { useState, useEffect, useRef } from 'react';

interface HoverButtonProps {
  label: string | React.ReactNode;
  onTrigger: () => void;
  isActive: boolean;
  className?: string;
  progressColor?: string;
  children?: React.ReactNode;
}

export const HoverButton: React.FC<HoverButtonProps> = ({ 
  label, 
  onTrigger, 
  isActive, 
  className = "",
  progressColor = "bg-indigo-600",
  children
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // How long to hover before triggering (ms)
  const TRIGGER_DELAY = 500;

  const handleMouseEnter = () => {
    // Don't trigger if already active to avoid unnecessary re-renders or logic
    if (isActive) return;

    setIsHovering(true);
    
    // Start the timer
    timeoutRef.current = setTimeout(() => {
      onTrigger();
      setIsHovering(false); // Reset visual state after trigger
    }, TRIGGER_DELAY);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden cursor-pointer select-none group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
    >
      {/* Background Progress Fill */}
      <div 
        className={`absolute inset-0 opacity-10 ${progressColor} transition-transform duration-[500ms] ease-linear origin-left`}
        style={{ 
          transform: isHovering && !isActive ? 'scaleX(1)' : 'scaleX(0)',
          width: '100%'
        }}
      />
      
      {/* Active State Indicator */}
      {isActive && (
        <div className={`absolute inset-0 opacity-100 ${progressColor} -z-10`} />
      )}

      {children}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {label}
      </div>
    </div>
  );
};