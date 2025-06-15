
export const useDashboardSpacing = (currentSlide: number) => {
  const isBalanceView = currentSlide === 0;
  const isLoansCreditsView = currentSlide === 1;
  const isMonthlyPaymentsView = currentSlide === 2;

  const getCarouselSpacing = () => {
    if (isBalanceView) return 'mb-1';
    if (isLoansCreditsView) return 'mb-0';
    if (isMonthlyPaymentsView) return 'mb-1';
    return 'mb-0';
  };

  return {
    isBalanceView,
    isLoansCreditsView,
    isMonthlyPaymentsView,
    carouselSpacing: getCarouselSpacing()
  };
};
