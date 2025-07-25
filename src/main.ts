import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix(configService.get<string>('api.prefix') || 'api');

    app.enableCors();

    const port = configService.get<number>('port') || 3000;
    await app.listen(port);

    console.log(`Application is running on: http://localhost:${port}`);
    console.log(
      `API available at: http://localhost:${port}/${configService.get<string>('api.prefix') || 'api'}`,
    );
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}
bootstrap();
