abstract class MinhotecaError extends Error {
  code: number;
  constructor(message: string, code: number, stack?: string) {
    super(message);
    this.stack = stack;
    this.name = 'GenericError';
    this.code = code;
  }
}

export class UnspecifiedError extends MinhotecaError {
  constructor(message: string, code: number, stack?: string) {
    super(message, code, stack);
    this.name = 'UnspecifiedError';
  }
}

export class InvalidParameterError extends MinhotecaError {
  constructor(message: string, code: number, stack?: string) {
    super(message, code, stack);
    this.name = 'InvalidParameterError';
  }
}

export class ResourceNotFoundError extends MinhotecaError {
  constructor(message: string, code: number, stack?: string) {
    super(message, code, stack);
    this.name = 'ResourceNotFoundError';
  }
}

export class AttributeValueNotSetError extends MinhotecaError {
  constructor(message: string, code: number, stack?: string) {
    super(message, code, stack);
    this.name = 'AttributeValueNotSetError';
  }
}

export class S3BucketError extends MinhotecaError {
  constructor(message: string, code: number, stack?: string) {
    super(message, code, stack);
    this.name = 'S3BucketError';
  }
}

export class S3ObjectError extends MinhotecaError {
  constructor(message: string, code: number, stack?: string) {
    super(message, code, stack);
    this.name = 'S3ObjectError';
  }
}

export class ErrorStrategy {
  error!: Error;
  errorName: string | undefined;
  code: number;
  message: string | undefined;

  constructor(error: Error, code?: number) {
    this.error = error;
    this.errorName = Object.getOwnPropertyDescriptor(error, 'name')?.value ?? 'ERRO';
    this.message = Object.getOwnPropertyDescriptor(error, 'message')?.value ?? undefined;
    this.code = code ?? 500;
  }

  createError() {
    switch (this.errorName) {
      case 'ValidationException':
        return new InvalidParameterError(
          'Erro na definição das expressões de busca.',
          this.code,
          JSON.stringify(this.error),
        );
      case 'InvalidParameterError':
        return new InvalidParameterError(
          this.message ?? 'Os parâmetros informados não foram aceitos.',
          this.code,
          this.error.stack ?? JSON.stringify(this.error),
        );
      case 'ResourceNotFoundException':
        return new ResourceNotFoundError('Recurso não encontrado.', this.code, JSON.stringify(this.error));
      case 'AttributeValueNotSetError':
        return new AttributeValueNotSetError('Recurso não encontrado.', this.code, JSON.stringify(this.error));
      case 'NoSuchBucket':
        return new S3BucketError('Erro ao buscar dados no bucket determinado', this.code, JSON.stringify(this.error));
      case 'NoSuchObject':
        return new S3ObjectError('Erro ao buscar objeto determinado', this.code, JSON.stringify(this.error));
      default:
        return new UnspecifiedError('Erro indeterminado!', this.code, JSON.stringify(this.error));
    }
  }
}
