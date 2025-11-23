import { ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClientKnownRequestError, PrismaClientRustPanicError } from '@prisma/client/runtime/library';
import { PrismaClientExceptionFilter } from './prisma-exception.filter';

describe('PrismaClientExceptionFilter', () => {
  let filter: PrismaClientExceptionFilter;
  let mockArgumentsHost: DeepMockProxy<ArgumentsHost>;
  let mockResponse: DeepMockProxy<Response>;
  let mockRequest: DeepMockProxy<Request>;

  beforeEach(() => {
    filter = new PrismaClientExceptionFilter();

    mockRequest = mockDeep<Request>();
    mockResponse = mockDeep<Response>();

    mockResponse.status.mockReturnValue(mockResponse);
    mockResponse.json.mockReturnValue(mockResponse);

    mockArgumentsHost = mockDeep<ArgumentsHost>();

    mockArgumentsHost.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest as Request,
      getResponse: () => mockResponse,
      getNext: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('catch', () => {
    it('should return 409 for P2002 unique constraint violation', () => {
      const exception = new PrismaClientKnownRequestError('Unique constraint failed on the fields: (`email`)', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });

    it('should return 409 for P2003 foreign key constraint violation', () => {
      const exception = new PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
        clientVersion: '5.0.0',
        meta: { field_name: 'organizationId' },
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });

    it('should return 404 for P2025 record not found', () => {
      const exception = new PrismaClientKnownRequestError('Record to delete does not exist', {
        code: 'P2025',
        clientVersion: '5.0.0',
        meta: {},
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 for unknown Prisma error codes', () => {
      const exception = new PrismaClientKnownRequestError('Unknown error', {
        code: 'P9999',
        clientVersion: '5.0.0',
        meta: {},
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should return 500 for any exception that is not a PrismaClientKnownRequestError', () => {
      const exception = new PrismaClientRustPanicError('', '');

      filter.catch(exception, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
