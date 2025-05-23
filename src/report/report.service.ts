import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { RevenueDto } from './entities/revenue.entity';
import { ProfitDto } from './entities/profit.entity';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) { }

  // Get Revenue by Store for a given period
  async getRevenueByStore(userSub: string, period: string): Promise<RevenueDto> {
    // Automatically determine date range based on the period
    const { startDate, endDate } = this.getDateRange(period);
    // Get the sales data for the given period
    const salesData = await this.reportRepository.getSalesByStore(userSub, startDate, endDate);


    // Calculate Gross Revenue
    const grossRevenue = salesData.reduce((total, sale) => total + sale._sum.price * sale._sum.stock, 0);

    // Calculate Revenue Growth (simple example - compare to previous period)
    const previousRevenue = 0; // Fetch this dynamically if needed (from DB)
    const revenueGrowth = previousRevenue ? (grossRevenue - previousRevenue) / previousRevenue * 100 : 0;

    // Format and return the revenue data
    return {
      period: period, // "Month", "Quarter", or "Year"
      periodLabel: this.getPeriodLabel(period), // E.g., 'January', 'Q1', '2025'
      revenueSource: 'Product Sales',
      grossRevenue,
      otherIncome: 0, // For now, assume no other income
      totalRevenue: grossRevenue, // Same as grossRevenue for now
      revenueGrowth,
    };
  }

  private getMonthDateRange(month: string): { startDate: Date, endDate: Date } {
    const monthIndex = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ].indexOf(month.toLowerCase());

    if (monthIndex === -1) {
      throw new Error('Invalid month provided');
    }

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, monthIndex, 1);
    const endDate = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59); // Last day of the month

    return { startDate, endDate };
  }


  // Get Profit and Loss by Store for a given period
  async getProfitLossByStore(userSub: string, period: string, month: string): Promise<any> {
    const validMonths = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    if (month && validMonths.includes(month.toLowerCase())) {
      // Get date range for the specific month
      const { startDate, endDate } = this.getMonthDateRange(month.toLowerCase());

      // Get Revenue (Sales) for the month
      const salesData = await this.reportRepository.getSalesByStore(userSub, startDate, endDate);

      // Get Inventory (for COGS calculation)
      const inventoryData = await this.reportRepository.getInventoryByStore(userSub);

      // Calculate COGS (Cost of Goods Sold)
      let totalCOGS = 0;
      salesData.forEach((sale) => {
        const inventoryItem = inventoryData.find((inv) => inv.PLU === sale.PLU);
        if (inventoryItem) {
          totalCOGS += inventoryItem.price * sale._sum.stock;
        }
      });

      // Get Operating Expenses (placeholder, replace with actual logic if needed)
      const operatingExpenses = { _sum: { salary: 0 } };

      // Calculate Profits
      const totalRevenue = salesData.reduce((total, sale) => total + sale._sum.price * sale._sum.stock, 0);
      const grossProfit = totalRevenue - totalCOGS;
      const operatingProfit = grossProfit - operatingExpenses._sum.salary;
      const netProfit = operatingProfit;

      return {
        revenue: totalRevenue,
        costOfGoodsSold: totalCOGS,
        grossProfit,
        operatingExpenses: operatingExpenses._sum.salary,
        operatingProfit,
        netProfit,
      };
    } else {
      // Invalid or missing month — fallback to period-based calculation
      const { startDate, endDate } = this.getDateRange(period);

      const salesData = await this.reportRepository.getSalesByStore(userSub, startDate, endDate);
      const inventoryData = await this.reportRepository.getInventoryByStore(userSub);

      let totalCOGS = 0;
      salesData.forEach((sale) => {
        const inventoryItem = inventoryData.find((inv) => inv.PLU === sale.PLU);
        if (inventoryItem) {
          totalCOGS += inventoryItem.price * sale._sum.stock;
        }
      });

      const operatingExpenses = { _sum: { salary: 0 } };

      const totalRevenue = salesData.reduce((total, sale) => total + sale._sum.price * sale._sum.stock, 0);
      const grossProfit = totalRevenue - totalCOGS;
      const operatingProfit = grossProfit - operatingExpenses._sum.salary;
      const netProfit = operatingProfit;

      return {
        revenue: totalRevenue,
        costOfGoodsSold: totalCOGS,
        grossProfit,
        operatingExpenses: operatingExpenses._sum.salary,
        operatingProfit,
        netProfit,
      };
    }
  }


  // Helper function to get the period label (e.g., 'January', 'Q1', '2025')
  private getPeriodLabel(period: string): string {
    const today = new Date();
    if (period === 'month') {
      return today.toLocaleString('default', { month: 'long' }) + ' ' + today.getFullYear();
    }
    if (period === 'quarter') {
      const quarter = Math.floor(today.getMonth() / 3) + 1;
      return `Q${quarter} ${today.getFullYear()}`;
    }
    if (period === 'year') {
      return today.getFullYear().toString();
    }
    return ''; // Default case
  }




  // Helper function to get the date range based on the period
  private getDateRange(period: string) {
    const today = new Date();
    let startDate, endDate;

    if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
    } else if (period === 'quarter') {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      startDate = new Date(today.getFullYear(), quarterStartMonth, 1);
      endDate = today;
    } else if (period === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = today;
    }

    return { startDate, endDate };
  }
}
