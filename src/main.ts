import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: configService.get<string>('app.cors.origin'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (configService.get<string>('app.env') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('IRED PropertyOS API')
      .setDescription('Commercial Real Estate Operations Platform API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT access token',
          in: 'header',
        },
        'access-token',
      )
      .addTag('auth', 'Authentication and OTP verification')
      .addTag('users', 'User management and assignments')
      .addTag('reference', 'Reference data management')
      .addTag('buildings', 'Building (property) management')
      .addTag('floors', 'Floor management')
      .addTag('units', 'Unit management')
      .addTag('contacts', 'Contact management')
      .addTag('media', 'Media and document management')
      .addTag('change-requests', 'Worker change requests and approvals')
      .addTag('search', 'Property search')
      .addTag('dashboard', 'Dashboard metrics')
      .addTag('health', 'Health checks')
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory);
  }

  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
