import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix: /api
  app.setGlobalPrefix('api');

  // Security middlewares
  app.use(helmet());
  app.use(cookieParser());

  // CORS: comma-separated origins from CLIENT_URL with credentials
  const clientUrl = config.get<string>('clientUrl', 'http://localhost:5173');
  const allowedOrigins = clientUrl.split(',').map((origin) => origin.trim());
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
      if (!origin) {
        callback(null, true);
        return;
      }
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === '*' || allowed === origin) return true;
        if (allowed.includes('*')) {
          const regex = new RegExp(
            '^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$',
          );
          return regex.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger docs (only in non-production)
  const nodeEnv = config.get<string>('nodeEnv', 'development');
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Recipe Site API')
      .setDescription('API documentation for the Recipe Website backend')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('recipe_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = config.get<number>('port', 3000);
  await app.listen(port);
  console.log(`Recipe API is running on http://localhost:${port}/api`);
  if (nodeEnv !== 'production') {
    console.log(
      `Swagger documentation available at http://localhost:${port}/docs`,
    );
  }
}

await bootstrap();
