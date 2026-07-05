// apps/api/src/main.ts
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        // Mobile apps (Flutter) and server-to-server calls have no Origin header
        callback(null, true);
        return;
      }
      const allowed: Array<string | RegExp> = [
        /^http:\/\/localhost:\d+$/,
        /^https:\/\/.*\.vercel\.app$/,
      ];
      if (process.env.CORS_ORIGIN) {
        allowed.push(process.env.CORS_ORIGIN);
      }
      const isAllowed = allowed.some((p) =>
        typeof p === 'string' ? p === origin : p.test(origin),
      );
      isAllowed ? callback(null, true) : callback(new Error('CORS not allowed'));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Huggi Hospital Queue API')
    .setDescription(
      'REST API for Huggi Super App — clinic queue and appointment management for Indian clinics.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  await app.listen(3001);
  console.log('Huggi API running on http://localhost:3001/api');
  console.log('Swagger UI:  http://localhost:3001/api/docs');
  console.log('OpenAPI JSON: http://localhost:3001/api/docs-json');
}

bootstrap();
