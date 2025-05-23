import { PartialType } from '@nestjs/swagger';
import { CreateGrowthDto } from './create-growth.dto';

export class UpdateGrowthDto extends PartialType(CreateGrowthDto) {}
