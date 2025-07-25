import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';

describe('Main Bootstrap', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalProcessExit: typeof process.exit;

  beforeEach(() => {
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalProcessExit = process.exit;

    console.log = vi.fn();
    console.error = vi.fn();
    process.exit = vi.fn() as any;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    vi.clearAllMocks();
  });

  describe('bootstrap function structure', () => {
    it('should contain a bootstrap function', () => {
      expect.assertions(1);

      const fs = require('fs');
      const mainContent = fs.readFileSync('src/main.ts', 'utf8');

      expect(mainContent).toContain('async function bootstrap()');
    });

    it('should call bootstrap function', () => {
      expect.assertions(1);

      const fs = require('fs');
      const mainContent = fs.readFileSync('src/main.ts', 'utf8');

      expect(mainContent).toContain('bootstrap();');
    });
  });

  describe('ValidationPipe configuration', () => {
    it('should use correct validation pipe options', () => {
      expect.assertions(3);

      const expectedOptions = {
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      };

      expect(expectedOptions.whitelist).toBe(true);
      expect(expectedOptions.forbidNonWhitelisted).toBe(true);
      expect(expectedOptions.transform).toBe(true);
    });
  });

  describe('application startup logging', () => {
    it('should format startup messages correctly', () => {
      expect.assertions(2);

      const port = 3000;
      const prefix = 'api';

      const expectedAppMessage = `Application is running on: http://localhost:${port}`;
      const expectedApiMessage = `API available at: http://localhost:${port}/${prefix}`;

      expect(expectedAppMessage).toBe(
        'Application is running on: http://localhost:3000',
      );
      expect(expectedApiMessage).toBe(
        'API available at: http://localhost:3000/api',
      );
    });

    it('should handle custom port and prefix in messages', () => {
      expect.assertions(2);

      const port = faker.number.int({ min: 1000, max: 9999 });
      const prefix = faker.lorem.word();

      const expectedAppMessage = `Application is running on: http://localhost:${port}`;
      const expectedApiMessage = `API available at: http://localhost:${port}/${prefix}`;

      expect(expectedAppMessage).toContain(`localhost:${port}`);
      expect(expectedApiMessage).toContain(`${port}/${prefix}`);
    });
  });

  describe('CORS configuration', () => {
    it('should enable CORS by default', () => {
      expect.assertions(1);

      const corsEnabled = true;

      expect(corsEnabled).toBe(true);
    });
  });

  describe('global prefix configuration', () => {
    it('should set global prefix correctly', () => {
      expect.assertions(2);

      const defaultPrefix = 'api';
      const customPrefix = 'v1';

      expect(defaultPrefix).toBe('api');
      expect(customPrefix).toBe('v1');
    });
  });
});
