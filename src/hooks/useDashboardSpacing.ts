
export const useDashboardSpacing = (currentSlide: number) => {
  const isBalanceView = currentSlide === 0;
  const isLoansCreditsView = currentSlide === 1;
  const isMonthlyPaymentsView = currentSlide === 2;

  const getCarouselSpacing = () => {
    return 'mb-4';
  };

  return {
    isBalanceView,
    isLoansCreditsView,
    isMonthlyPaymentsView,
    carouselSpacing: getCarouselSpacing()
  };
};
