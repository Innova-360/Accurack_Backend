import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreRepository } from './store.repository';
import { StoreService } from './store.service';

@Module({
  controllers: [StoreController],
  providers: [StoreService, StoreRepository],

})
export class StoreModule { }
