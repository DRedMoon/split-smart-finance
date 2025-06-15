
export const useDashboardSpacing = (currentSlide: number) => {
  const isBalanceView = currentSlide === 0;
  const isLoansCreditsView = currentSlide === 1;
  const isMonthlyPaymentsView = currentSlide === 2;

  const getCarouselSpacing = () => {
    // Remove all spacing - make it completely compact
    return 'mb-0';
  };

  return {
    isBalanceView,
    isLoansCreditsView,
    isMonthlyPaymentsView,
    carouselSpacing: getCarouselSpacing()
  };
};
