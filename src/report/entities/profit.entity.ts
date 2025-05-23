import { IsNumber, IsString } from 'class-validator';

export class ProfitDto {
    @IsString()
    period: string;

    @IsString()
    periodLabel: string;

    @IsNumber()
    revenue: number;

    @IsNumber()
    cogs: number;

    @IsNumber()
    grossProfit: number;

    @IsNumber()
    operatingExpenses: number;

    @IsNumber()
    operatingProfit: number;

    @IsNumber()
    interestTaxes: number;

    @IsNumber()
    netProfit: number;
}
