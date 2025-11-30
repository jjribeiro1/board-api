import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
} from 'generated/prisma/internal/prismaNamespace';
import { Response } from 'express';

type PrismaClientErrors =
  | PrismaClientInitializationError
  | PrismaClientKnownRequestError
  | PrismaClientUnknownRequestError
  | PrismaClientRustPanicError
  | PrismaClientValidationError;

@Catch(
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
)
export class PrismaClientExceptionFilter implements ExceptionFilter<PrismaClientErrors> {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name, { timestamp: true });

  catch(exception: PrismaClientErrors, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    this.logger.error(`Error occurred in ${request.method} ${request.url}`);

    if (exception instanceof PrismaClientKnownRequestError) {
      const { code, meta } = exception;

      if (code === 'P2002') {
        this.logger.error(`PRISMA ERROR CODE: P2002 - Unique constraint validation error - TARGET: ${meta?.target}`);
        return response.status(409).json({
          statusCode: 409,
          message: 'Erro interno no servidor, dados inválidos',
          error: 'Conflict',
        });
      }

      if (code === 'P2003') {
        this.logger.error(`PRISMA ERROR CODE: P2002 - Foreign key constraint error - TARGET: ${meta?.field_name}`);
        return response.status(409).json({
          statusCode: 409,
          message: 'Erro interno no servidor, dados inválidos',
          error: 'Conflict',
        });
      }

      if (code === 'P2025') {
        this.logger.error(
          `PRISMA ERROR CODE: P2025 - An operation failed because it depends on one or more records that were required but not found`,
        );
        return response.status(404).json({
          statusCode: 404,
          message: 'Dados não encontrados para realizar a operação',
          error: 'Not Found',
        });
      }
    }

    this.logger.error('Unhandled Prisma client error:', exception);
    return response.status(500).json({
      statusCode: 500,
      message: 'Erro interno no servidor',
      error: 'Internal Server Error',
    });
  }
}
