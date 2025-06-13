
import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import BalanceCard from './BalanceCard';
import LoansCreditsCard from './LoansCreditsCard';
import MonthlyPaymentsCard from './MonthlyPaymentsCard';

interface DashboardCarouselProps {
  balance: number;
  loans: any[];
  monthlyBills: any[];
  totalLoanAmount: number;
  totalMonthlyPayments: number;
  totalBillsAmount: number;
}

const DashboardCarousel = ({ 
  balance, 
  loans, 
  monthlyBills, 
  totalLoanAmount, 
  totalMonthlyPayments, 
  totalBillsAmount 
}: DashboardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      if (api && event.detail?.index !== undefined) {
        api.scrollTo(event.detail.index);
      }
    };

    const carousel = document.querySelector('[data-dashboard-carousel]');
    if (carousel) {
      carousel.addEventListener('navigate-dashboard', handleNavigation as EventListener);
      return () => {
        carousel.removeEventListener('navigate-dashboard', handleNavigation as EventListener);
      };
    }
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  return (
    <div className="mb-6" data-dashboard-carousel>
      <Carousel 
        className="w-full"
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          <CarouselItem>
            <BalanceCard balance={balance} />
          </CarouselItem>
          <CarouselItem>
            <LoansCreditsCard 
              loans={loans}
              totalLoanAmount={totalLoanAmount}
              totalMonthlyPayments={totalMonthlyPayments}
            />
          </CarouselItem>
          <CarouselItem>
            <MonthlyPaymentsCard 
              monthlyBills={monthlyBills}
              totalBillsAmount={totalBillsAmount}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      {/* Carousel Indicators - Clickable */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
              index === current ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardCarousel;
