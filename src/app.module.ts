import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SimulationsModule } from './simulations/simulations.module.js';

@Module({
  imports: [SimulationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
