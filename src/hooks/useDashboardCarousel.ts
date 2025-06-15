
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useDashboardCarousel = () => {
  const location = useLocation();
  const [carouselApi, setCarouselApi] = useState(null);
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
      
      window.history.replaceState({}, '', '/');
    } else {
      setNavigationReady(true);
    }
  }, [location.search]);

  // Navigate when carousel API is ready and we have a target view
  useEffect(() => {
    if (carouselApi && initialView !== 0) {
      console.log('Dashboard - Navigating carousel to view:', initialView);
      setTimeout(() => {
        carouselApi.scrollTo(initialView);
        setNavigationReady(true);
      }, 50);
    } else if (carouselApi) {
      setNavigationReady(true);
    }
  }, [carouselApi, initialView]);

  // Track carousel slide changes
  useEffect(() => {
    if (carouselApi) {
      carouselApi.on("select", () => {
        setCurrentSlide(carouselApi.selectedScrollSnap());
      });
    }
  }, [carouselApi]);

  return {
    carouselApi,
    setCarouselApi,
    initialView,
    navigationReady,
    currentSlide
  };
};
