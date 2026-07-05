import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AdminToursController } from './admin-tours.controller';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

@Module({
  imports: [AuthModule],
  controllers: [ToursController, AdminToursController],
  providers: [ToursService],
  exports: [ToursService],
})
export class ToursModule {}
