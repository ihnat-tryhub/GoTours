import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

type ErrorResponseBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = this.createResponseBody(exception, statusCode, request);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : JSON.stringify(exception));
    }

    response.status(statusCode).json(body);
  }

  private createResponseBody(
    exception: unknown,
    statusCode: number,
    request: Request,
  ): ErrorResponseBody {
    const timestamp = new Date().toISOString();
    const path = request.originalUrl;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          statusCode,
          message: response,
          path,
          timestamp,
        };
      }

      if (this.isObjectResponse(response)) {
        return {
          statusCode,
          message: this.getMessage(response, exception.message),
          error: this.getError(response),
          path,
          timestamp,
        };
      }
    }

    return {
      statusCode,
      message: this.getInternalErrorMessage(),
      path,
      timestamp,
    };
  }

  private isObjectResponse(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getMessage(response: Record<string, unknown>, fallback: string): string | string[] {
    const message = response.message;

    if (typeof message === 'string' || this.isStringArray(message)) {
      return message;
    }

    return fallback;
  }

  private getError(response: Record<string, unknown>): string | undefined {
    return typeof response.error === 'string' ? response.error : undefined;
  }

  private isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
  }

  private getInternalErrorMessage(): string {
    return this.configService.get<string>('NODE_ENV') === 'production'
      ? 'Internal server error.'
      : 'Internal server error. Check server logs for details.';
  }
}
