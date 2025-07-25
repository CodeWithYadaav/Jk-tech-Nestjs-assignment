import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';

import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('port', () => {
    it('should return default port 3000 when PORT is not set', () => {
      expect.assertions(1);

      delete process.env.PORT;

      const config = configuration();

      expect(config.port).toBe(3000);
    });

    it('should return PORT environment variable when set', () => {
      expect.assertions(1);

      const customPort = faker.number.int({ min: 1000, max: 9999 });
      process.env.PORT = customPort.toString();

      const config = configuration();

      expect(config.port).toBe(customPort);
    });

    it('should parse PORT as integer', () => {
      expect.assertions(2);

      process.env.PORT = '8080';

      const config = configuration();

      expect(config.port).toBe(8080);
      expect(typeof config.port).toBe('number');
    });
  });

  describe('database', () => {
    it('should return default database configuration when no env vars are set', () => {
      expect.assertions(5);

      delete process.env.DATABASE_TYPE;
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      delete process.env.DATABASE_USERNAME;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;

      const config = configuration();

      expect(config.database.type).toBe('mysql');
      expect(config.database.host).toBe('localhost');
      expect(config.database.port).toBe(3306);
      expect(config.database.username).toBe('root');
      expect(config.database.password).toBe('rootpassword');
    });

    it('should return custom database configuration when env vars are set', () => {
      expect.assertions(6);

      const customConfig = {
        type: 'postgresql',
        host: faker.internet.domainName(),
        port: faker.number.int({ min: 1000, max: 9999 }),
        username: faker.internet.username(),
        password: faker.internet.password(),
        database: faker.lorem.word(),
      };

      process.env.DATABASE_TYPE = customConfig.type;
      process.env.DATABASE_HOST = customConfig.host;
      process.env.DATABASE_PORT = customConfig.port.toString();
      process.env.DATABASE_USERNAME = customConfig.username;
      process.env.DATABASE_PASSWORD = customConfig.password;
      process.env.DATABASE_NAME = customConfig.database;

      const config = configuration();

      expect(config.database.type).toBe(customConfig.type);
      expect(config.database.host).toBe(customConfig.host);
      expect(config.database.port).toBe(customConfig.port);
      expect(config.database.username).toBe(customConfig.username);
      expect(config.database.password).toBe(customConfig.password);
      expect(config.database.database).toBe(customConfig.database);
    });

    it('should parse DATABASE_PORT as integer', () => {
      expect.assertions(2);

      process.env.DATABASE_PORT = '5432';

      const config = configuration();

      expect(config.database.port).toBe(5432);
      expect(typeof config.database.port).toBe('number');
    });

    it('should return default database name when DATABASE_NAME is not set', () => {
      expect.assertions(1);

      delete process.env.DATABASE_NAME;

      const config = configuration();

      expect(config.database.database).toBe('nestjs_app');
    });
  });

  describe('jwt', () => {
    it('should return default JWT configuration when no env vars are set', () => {
      expect.assertions(2);

      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRES_IN;

      const config = configuration();

      expect(config.jwt.secret).toBe('fallback-secret-key');
      expect(config.jwt.expiresIn).toBe('7d');
    });

    it('should return custom JWT configuration when env vars are set', () => {
      expect.assertions(2);

      const customSecret = faker.string.alphanumeric(64);
      const customExpiresIn = '30d';

      process.env.JWT_SECRET = customSecret;
      process.env.JWT_EXPIRES_IN = customExpiresIn;

      const config = configuration();

      expect(config.jwt.secret).toBe(customSecret);
      expect(config.jwt.expiresIn).toBe(customExpiresIn);
    });

    it('should handle various JWT expiration formats', () => {
      expect.assertions(4);

      const expirationFormats = ['1h', '24h', '7d', '30d'];

      expirationFormats.forEach((format) => {
        process.env.JWT_EXPIRES_IN = format;
        const config = configuration();
        expect(config.jwt.expiresIn).toBe(format);
      });
    });
  });

  describe('api', () => {
    it('should return default API configuration when no env vars are set', () => {
      expect.assertions(2);

      delete process.env.API_PREFIX;
      delete process.env.API_VERSION;

      const config = configuration();

      expect(config.api.prefix).toBe('api');
      expect(config.api.version).toBe('v1');
    });

    it('should return custom API configuration when env vars are set', () => {
      expect.assertions(2);

      const customPrefix = faker.lorem.word();
      const customVersion = `v${faker.number.int({ min: 1, max: 10 })}`;

      process.env.API_PREFIX = customPrefix;
      process.env.API_VERSION = customVersion;

      const config = configuration();

      expect(config.api.prefix).toBe(customPrefix);
      expect(config.api.version).toBe(customVersion);
    });

    it('should use default values when API env vars are set to empty strings', () => {
      expect.assertions(2);

      process.env.API_PREFIX = '';
      process.env.API_VERSION = '';

      const config = configuration();

      expect(config.api.prefix).toBe('api');
      expect(config.api.version).toBe('v1');
    });
  });

  describe('complete configuration', () => {
    it('should return complete configuration object with all properties', () => {
      expect.assertions(4);

      const config = configuration();

      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('jwt');
      expect(config).toHaveProperty('api');
    });

    it('should return correct configuration structure', () => {
      expect.assertions(10);

      const config = configuration();

      expect(config.database).toHaveProperty('type');
      expect(config.database).toHaveProperty('host');
      expect(config.database).toHaveProperty('port');
      expect(config.database).toHaveProperty('username');
      expect(config.database).toHaveProperty('password');
      expect(config.database).toHaveProperty('database');

      expect(config.jwt).toHaveProperty('secret');
      expect(config.jwt).toHaveProperty('expiresIn');

      expect(config.api).toHaveProperty('prefix');
      expect(config.api).toHaveProperty('version');
    });

    it('should work with mixed environment variables', () => {
      expect.assertions(6);

      process.env.PORT = '4000';
      process.env.DATABASE_HOST = 'custom-host';
      process.env.JWT_SECRET = 'custom-secret';
      delete process.env.API_PREFIX;

      const config = configuration();

      expect(config.port).toBe(4000);
      expect(config.database.host).toBe('custom-host');
      expect(config.database.type).toBe('mysql');
      expect(config.jwt.secret).toBe('custom-secret');
      expect(config.jwt.expiresIn).toBe('7d');
      expect(config.api.prefix).toBe('api');
    });
  });

  describe('edge cases', () => {
    it('should handle invalid PORT value gracefully', () => {
      expect.assertions(1);

      process.env.PORT = 'invalid-port';

      const config = configuration();

      expect(config.port).toBeNaN();
    });

    it('should handle invalid DATABASE_PORT value gracefully', () => {
      expect.assertions(1);

      process.env.DATABASE_PORT = 'invalid-port';

      const config = configuration();

      expect(config.database.port).toBeNaN();
    });

    it('should handle special characters in environment variables', () => {
      expect.assertions(3);

      process.env.DATABASE_PASSWORD = 'p@ssw0rd!@#$%^&*()';
      process.env.JWT_SECRET = 'secret-with-special-chars!@#';
      process.env.DATABASE_NAME = 'db_name-with-special.chars';

      const config = configuration();

      expect(config.database.password).toBe('p@ssw0rd!@#$%^&*()');
      expect(config.jwt.secret).toBe('secret-with-special-chars!@#');
      expect(config.database.database).toBe('db_name-with-special.chars');
    });

    it('should handle whitespace in environment variables', () => {
      expect.assertions(2);

      process.env.DATABASE_HOST = '  localhost  ';
      process.env.JWT_SECRET = '  secret-key  ';

      const config = configuration();

      expect(config.database.host).toBe('  localhost  ');
      expect(config.jwt.secret).toBe('  secret-key  ');
    });
  });
});
