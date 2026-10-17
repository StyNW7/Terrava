import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

// Telemetry ids are BigInt; serialise them as strings in JSON responses.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function (this: bigint) {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');
  const prefix = config.get('API_PREFIX');

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(cookieParser());
  // Avatars and livestock photos may arrive as data URLs.
  app.useBodyParser('json', { limit: '5mb' });

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition'],
  });
  app.setGlobalPrefix(prefix, { exclude: ['/'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.enableShutdownHooks();

  if (config.get('SWAGGER_ENABLED')) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Terrava API')
        .setDescription(
          'Backend for the Terrava smart livestock platform: farms, livestock, ear tag telemetry, alerts, AI insights, devices, team, reports and settings.\n\n' +
            'Dashboard routes use a Bearer access token from `POST /auth/login`. IoT ingest routes use a gateway key in the `x-device-key` header.',
        )
        .setVersion('1.0.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'x-device-key', in: 'header' }, 'device-key')
        .build(),
    );
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: 'Terrava API',
    });
  }

  const port = config.get('PORT');
  await app.listen(port, '0.0.0.0');
  logger.log(`Terrava API ready on http://localhost:${port}/${prefix}`);
  if (config.get('SWAGGER_ENABLED')) logger.log(`OpenAPI docs on http://localhost:${port}/docs`);
}

void bootstrap();
