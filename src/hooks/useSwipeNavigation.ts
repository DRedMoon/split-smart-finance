import { useState, useRef, useCallback } from 'react';


interface SwipeNavigationProps {
  totalViews: number;
  currentView: number;
  onViewChange?: (viewIndex: number) => void;
}

export const useSwipeNavigation = ({ 
  totalViews, 
  currentView, 
  onViewChange 
}: SwipeNavigationProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const navigateToView = useCallback((viewIndex: number) => {
    if (viewIndex >= 0 && viewIndex < totalViews && viewIndex !== currentView) {
      setIsTransitioning(true);
      onViewChange?.(viewIndex);
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentView, totalViews, onViewChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    console.log('🔥 Swipe: Touch start detected', e.touches[0].clientX, e.touches[0].clientY);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    console.log('🔥 Swipe: Touch end detected', touchStartX.current, touchStartY.current);
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    console.log('🔥 Swipe: Delta calculated', { deltaX, deltaY, currentView });
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      console.log('🔥 Swipe: Valid swipe detected', deltaX > 0 ? 'left' : 'right');
      if (deltaX > 0) {
        // Swipe left - next view
        console.log('🔥 Swipe: Navigating to next view', currentView + 1);
        navigateToView(currentView + 1);
      } else {
        // Swipe right - previous view
        console.log('🔥 Swipe: Navigating to previous view', currentView - 1);
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
    isTransitioning,
    navigateToView,
    swipeHandlers,
    containerRef
  };
};