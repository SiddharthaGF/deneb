import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint()
  @Render('index.hbs')
  root() {
    return {
      tittle: 'Deneb API ✨ Queuing theory calculator',
      nameProject: 'Deneb Api',
      description: 'Queuing theory calculator',
    };
  }
}
