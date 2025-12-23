import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');

  app.enableCors({
    credentials: true,
    origin: configService.get('CLIENT_URL'),
  });

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Feedback board api')
    .setDescription('Api to manage and collect user feedback')
    .setVersion('1.0')
    .addTag('health')
    .addTag('auth')
    .addTag('users')
    .addTag('organizations')
    .addTag('boards')
    .addTag('posts')
    .addTag('comments')
    .addTag('status')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT, () => {
    console.log('server is running');
  });
}
bootstrap().catch((err) => {
  console.error('failed to start server: ', err);
  process.exit(1);
});
