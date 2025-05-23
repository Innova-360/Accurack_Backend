import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getAllChannels(){
    return [
      {
        name: "Online Store",
        data: [14, 25, 21, 17, 12, 13, 11],
      },
      {
        name: "Amazon Marketplace",
        data: [13, 23, 20, 8, 13, 27, 33],
      },
      {
        name: "eBay Marketplace",
        data: [11, 17, 15, 15, 21, 14, 15],
      },
      {
        name: "Physical Store",
        data: [50, 27, 13, 19, 16, 10, 5],
      },
      {
        name: "Distributors",
        data: [33, 4, 25, 20, 24, 11, 44],
      },
    ]
  }

  async getTopSellingProducts(){
    return [
      { name: "ASOS Ridey", price: 25.05, quantity: 73, amount: 1.828 },
      {
        name: "Philip Morris International",
        price: 85.05,
        quantity: 84,
        amount: 7.144,
      },
      { name: "Donna Karan", price: 96.05, quantity: 94, amount: 9.028 },
      { name: "Marco Pollo", price: 31.09, quantity: 51, amount: 1.585 },
      { name: "Dolce Gabbana", price: 27.09, quantity: 78, amount: 2.113 },
    ]
  }

  async getTotalSales(){
    return {
      series1: [2000, 3200, 3250, 4700, 3900, 4900, 3200],
      series2: [1500, 1900, 1800, 2900, 2600, 3200, 2200],
    }
  }
}
