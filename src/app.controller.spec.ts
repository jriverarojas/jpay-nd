/**
 * @fileoverview Unit tests for AppController
 * @module app.controller.spec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let i18nService: I18nService;

  beforeEach(async () => {
    const mockI18nService = {
      translate: jest.fn().mockResolvedValue('Hello World!'),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    i18nService = app.get<I18nService>(I18nService);
  });

  describe('root', () => {
    it('should return the translated greeting message', async () => {
      const result = await appController.getHello();
      expect(result).toBe('Hello World!');
      expect(i18nService.translate).toHaveBeenCalledWith('app.hello', { lang: undefined });
    });

    it('should return the translated greeting message with language parameter', async () => {
      const result = await appController.getHello('es');
      expect(result).toBe('Hello World!');
      expect(i18nService.translate).toHaveBeenCalledWith('app.hello', { lang: 'es' });
    });
  });
});
