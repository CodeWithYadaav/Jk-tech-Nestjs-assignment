export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    type: process.env.DATABASE_TYPE || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'rootpassword',
    database: process.env.DATABASE_NAME || 'nestjs_app',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
  },
});
