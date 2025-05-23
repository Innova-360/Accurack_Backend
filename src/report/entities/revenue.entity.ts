import { IsNumber, IsString } from 'class-validator';

export class RevenueDto {
    @IsString()
    period: string; // This will be "Month", "Quarter", or "Year"

    @IsString()
    periodLabel: string; // E.g., 'January', 'Q1', '2025'

    @IsString()
    revenueSource: string;

    @IsNumber()
    grossRevenue: number;

    @IsNumber()
    otherIncome: number;

    @IsNumber()
    totalRevenue: number;

    @IsNumber()
    revenueGrowth: number;
}
