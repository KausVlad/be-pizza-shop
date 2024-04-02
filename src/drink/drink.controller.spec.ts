import { Test, TestingModule } from '@nestjs/testing';
import { DrinkController } from './drink.controller';

describe('DrinkController', () => {
  let controller: DrinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrinkController],
    }).compile();

    controller = module.get<DrinkController>(DrinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
