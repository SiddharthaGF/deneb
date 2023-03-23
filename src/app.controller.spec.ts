import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return an object containing the tittle "Deneb"', () => {
      const result = appController.root();
      expect(result).toEqual(
        expect.objectContaining({
          description: 'Queuing theory calculator',
          nameProject: 'Deneb Api',
          tittle: 'Deneb API ✨ Queuing theory calculator',
        }),
      );
    });
  });
});
