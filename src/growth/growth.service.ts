import { Injectable } from '@nestjs/common';

@Injectable()
export class GrowthService {

  async customerGrowth() {
    return {
      currentWeek: [49, 55, 70, 78, 103, 150],
      previousWeek: [14, 25, 30, 38, 43, 45]
    };
  }

  async productGrowth() {
    return {
      currentWeek: [490, 555, 790, 1008, 1010, 1150],
      previousWeek: [340, 425, 30, 238, 443, 345]
    };
  }

  async visitorsGrowth() {
    return {
      activeVisitors: [341, 350, 460, 370, 300, 240, 250],
      bouncedVisitors: [141, 250, 260, 270, 300, 330, 360]
    };
  }
}
