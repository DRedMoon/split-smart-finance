import React, { useState, useRef, useCallback } from 'react';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  currentSlide: number;
  onSlideChange: (slideIndex: number) => void;
  className?: string;
}

export const SwipeableCarousel = ({ 
  children, 
  currentSlide, 
  onSlideChange,
  className = ""
}: SwipeableCarouselProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    console.log('🔥 Carousel: Touch start detected', e.touches[0].clientX, e.touches[0].clientY);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    e.preventDefault(); // Prevent default scroll behavior
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    console.log('🔥 Carousel: Touch end detected', touchStartX.current, touchStartY.current);
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    console.log('🔥 Carousel: Delta calculated', { deltaX, deltaY, currentSlide });
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      console.log('🔥 Carousel: Valid swipe detected', deltaX > 0 ? 'left' : 'right');
      
      setIsTransitioning(true);
      e.preventDefault(); // Prevent any default behavior
      
      if (deltaX > 0 && currentSlide < children.length - 1) {
        // Swipe left - next slide
        console.log('🔥 Carousel: Navigating to next slide', currentSlide + 1);
        onSlideChange(currentSlide + 1);
      } else if (deltaX < 0 && currentSlide > 0) {
        // Swipe right - previous slide
        console.log('🔥 Carousel: Navigating to previous slide', currentSlide - 1);
        onSlideChange(currentSlide - 1);
      }
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  }, [currentSlide, children.length, onSlideChange]);

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Indicators */}
      <div className="absolute top-4 right-4 flex space-x-1 z-10">
        {children.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
      
      {/* Carousel Content */}
      <div 
        className={`overflow-hidden ${
          isTransitioning ? 'pointer-events-none' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};