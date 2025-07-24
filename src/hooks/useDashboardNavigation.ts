import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useDashboardNavigation = () => {
  const location = useLocation();
  const [initialView, setInitialView] = useState(0);
  const [navigationReady, setNavigationReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Handle returnTo parameter immediately
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const returnTo = urlParams.get('returnTo');
    
    if (returnTo) {
      console.log('Dashboard - Processing returnTo:', returnTo);
      const viewIndex = returnTo === 'balance' ? 0 : 
                       returnTo === 'loans-credits' ? 1 : 
                       returnTo === 'monthly-payments' ? 2 : 0;
      
      console.log('Dashboard - Setting initial view to:', viewIndex);
      setInitialView(viewIndex);
      setCurrentSlide(viewIndex);
      
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
    
    // Always set navigation ready after processing
    setNavigationReady(true);
  }, [location.search]);

  const navigateToView = (viewIndex: number) => {
    setCurrentSlide(viewIndex);
  };

  return {
    initialView,
    navigationReady,
    currentSlide,
    navigateToView
  };
};