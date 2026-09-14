import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulationsModule } from './simulations/simulations.module';

@Module({
  imports: [SimulationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
