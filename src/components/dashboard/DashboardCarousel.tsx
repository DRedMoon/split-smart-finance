
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
  onApiReady?: (api: CarouselApi) => void;
  initialSlide?: number;
}

const DashboardCarousel = ({ 
  balance, 
  loans, 
  monthlyBills, 
  totalLoanAmount, 
  totalMonthlyPayments, 
  totalBillsAmount,
  onApiReady,
  initialSlide = 0
}: DashboardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialSlide);

  useEffect(() => {
    if (!api) {
      return
    }

    // Set initial slide if specified
    if (initialSlide !== 0) {
      api.scrollTo(initialSlide, false);
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })

    // Pass the API back to the parent
    if (onApiReady) {
      onApiReady(api);
    }
  }, [api, onApiReady, initialSlide])

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
          startIndex: initialSlide,
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
