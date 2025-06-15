
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
  currentSlide?: number;
}

const DashboardCarousel = ({ 
  balance, 
  loans, 
  monthlyBills, 
  totalLoanAmount, 
  totalMonthlyPayments, 
  totalBillsAmount,
  onApiReady,
  initialSlide = 0,
  currentSlide = 0
}: DashboardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return
    }

    // Set initial slide if specified
    if (initialSlide !== 0) {
      api.scrollTo(initialSlide, false);
    }

    // Pass the API back to the parent
    if (onApiReady) {
      onApiReady(api);
    }
  }, [api, onApiReady, initialSlide])

  return (
    <div data-dashboard-carousel>
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
            <BalanceCard balance={balance} currentSlide={currentSlide} />
          </CarouselItem>
          <CarouselItem>
            <LoansCreditsCard 
              loans={loans}
              totalLoanAmount={totalLoanAmount}
              totalMonthlyPayments={totalMonthlyPayments}
              currentSlide={currentSlide}
            />
          </CarouselItem>
          <CarouselItem>
            <MonthlyPaymentsCard 
              monthlyBills={monthlyBills}
              totalBillsAmount={totalBillsAmount}
              currentSlide={currentSlide}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default DashboardCarousel;
