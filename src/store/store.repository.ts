import { Injectable } from '@nestjs/common';
import { CreateReportDto } from 'src/report/dto/create-report.dto';
import { UpdateReportDto } from 'src/report/dto/update-report.dto';

@Injectable()
export class StoreRepository {

 globalReport: Array<any> = []
   constructor() {
     this.globalReport = [
       { id: 1, name: "store 1" },
       { id: 2, name: "store 2" },
       { id: 3, name: "store 3" }
     ]
   }
 
   create(createReportDto: CreateReportDto) {
     return 'This action adds a new report';
   }
 
   findAll() {
     return `This action returns all report`;
   }
 
   findOne(id: string) {
     return `This action returns a #${id} report`;
   }
 
   update(id: string, updateReportDto: UpdateReportDto) {
     return `This action updates a #${id} report`;
   }
 
   remove(id: string) {
     return `This action removes a #${id} report`;
   }

}
