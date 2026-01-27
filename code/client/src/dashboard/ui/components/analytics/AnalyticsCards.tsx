import React, { memo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AnalyticsData } from '@/dashboard/types';
import { formatNumber } from '@/dashboard/utils';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { TrendingUp, DollarSign, Percent, UserCheck, CreditCard, Package } from 'lucide-react';

interface AnalyticsCardsProps {
  analyticsData: AnalyticsData;
  nonQuoteSalesCount: number;
  currency: string;
  expenses: number;
  inventoryValue: number;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = memo(({ 
  analyticsData, 
  nonQuoteSalesCount,
  currency,
  expenses,
  inventoryValue
}) => {
  const isMobile = useIsMobile();
  
  const cards = [
    {
      title: "Total Sales",
      value: `${currency} ${formatNumber(analyticsData.totalSales)}`,
      description: `From ${nonQuoteSalesCount} transactions (excluding quotes)`,
      color: "text-sales-primary",
      bgColor: "bg-blue-50",
      icon: <DollarSign className="h-5 w-5 text-sales-primary" />
    },
    {
      title: "Total Gross Profit",
      value: `${currency} ${formatNumber(analyticsData.totalProfit)}`,
      description: analyticsData.totalProfit > 0 
        ? `${(analyticsData.totalProfit / analyticsData.totalSales * 100).toFixed(1)}% profit margin` 
        : "No profit yet",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      title: "Total Expenses",
      value: `${currency} ${formatNumber(expenses)}`,
      description: expenses > 0 && analyticsData.totalSales > 0
        ? `${(expenses / analyticsData.totalSales * 100).toFixed(1)}% of sales` 
        : "No expenses recorded",
      color: "text-[#f05a29]",
      bgColor: "bg-orange-50",
      icon: <Percent className="h-5 w-5 text-[#f05a29]" />
    },
    {
      title: "Inventory Value",
      value: `${currency} ${formatNumber(inventoryValue)}`,
      description: "Total value of current inventory",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: <Package className="h-5 w-5 text-green-600" />
    },
    {
      title: "Cash Sales",
      value: analyticsData.paidSalesCount.toString(),
      description: analyticsData.paidSalesCount + analyticsData.pendingSalesCount > 0 
        ? `${(analyticsData.paidSalesCount / (analyticsData.paidSalesCount + analyticsData.pendingSalesCount) * 100).toFixed(1)}% of total` 
        : "No sales yet",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: <UserCheck className="h-5 w-5 text-green-600" />
    },
    {
      title: "Credit Sales",
      value: analyticsData.pendingSalesCount.toString(),
      description: analyticsData.pendingSalesCount > 0 
        ? `${(analyticsData.pendingSalesCount / (analyticsData.paidSalesCount + analyticsData.pendingSalesCount) * 100).toFixed(1)}% of total` 
        : "No credit sales",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      icon: <CreditCard className="h-5 w-5 text-amber-500" />
    }
  ];

  return (
    <div className={`grid gap-4 w-full ${
      isMobile 
        ? 'grid-cols-2' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    }`}>
      {cards.map((card, index) => (
        <Card key={index} className={`w-full transition-all duration-200 hover:shadow-md ${
          isMobile ? 'border-l-4 border-l-blue-500' : ''
        }`}>
          <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${card.bgColor} ${isMobile ? 'p-1' : 'p-2'}`}>
                    <div className={isMobile ? 'scale-75' : ''}>
                      {card.icon}
                    </div>
                  </div>
                  <p className={`text-sm font-medium text-gray-600 ${
                    isMobile ? 'text-xs leading-tight' : ''
                  }`}>
                    {card.title}
                  </p>
                </div>
                <div className={`${card.color} font-bold mb-1 ${
                  isMobile ? 'text-lg' : 'text-2xl'
                }`}>
                  {card.value}
                </div>
                <p className={`text-muted-foreground ${
                  isMobile ? 'text-xs leading-tight' : 'text-xs'
                }`}>
                  {card.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

AnalyticsCards.displayName = 'AnalyticsCards';

export default AnalyticsCards;
