import { useState, useRef, useCallback } from 'react';

interface SwipeNavigationProps {
  totalViews: number;
  initialView?: number;
  onViewChange?: (viewIndex: number) => void;
}

export const useSwipeNavigation = ({ 
  totalViews, 
  initialView = 0, 
  onViewChange 
}: SwipeNavigationProps) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const navigateToView = useCallback((viewIndex: number) => {
    if (viewIndex >= 0 && viewIndex < totalViews && viewIndex !== currentView) {
      setIsTransitioning(true);
      setCurrentView(viewIndex);
      onViewChange?.(viewIndex);
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentView, totalViews, onViewChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe left - next view
        navigateToView(currentView + 1);
      } else {
        // Swipe right - previous view
        navigateToView(currentView - 1);
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  }, [currentView, navigateToView]);

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };

  return {
    currentView,
    isTransitioning,
    navigateToView,
    swipeHandlers,
    containerRef
  };
};