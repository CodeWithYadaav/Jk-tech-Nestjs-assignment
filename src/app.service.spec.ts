import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect.assertions(1);

      const result = service.getHello();

      expect(result).toBe('Hello World!');
    });

    it('should return a string', () => {
      expect.assertions(1);

      const result = service.getHello();

      expect(typeof result).toBe('string');
    });

    it('should always return the same message', () => {
      expect.assertions(3);

      const result1 = service.getHello();
      const result2 = service.getHello();
      const result3 = service.getHello();

      expect(result1).toBe('Hello World!');
      expect(result2).toBe('Hello World!');
      expect(result3).toBe('Hello World!');
    });

    it('should not return null or undefined', () => {
      expect.assertions(2);

      const result = service.getHello();

      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });

    it('should return a non-empty string', () => {
      expect.assertions(2);

      const result = service.getHello();

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
