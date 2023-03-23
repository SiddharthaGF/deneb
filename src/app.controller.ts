import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index.hbs')
  root() {
    return {
      tittle: 'Deneb API ✨ Queuing theory calculator',
      nameProject: 'Deneb Api',
      description: 'Queuing theory calculator',
    };
  }
}