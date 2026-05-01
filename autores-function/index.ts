import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UseCaseInterface, LogService } from '@gustavoadolfo/minhoteca-core-layer';
import { pathUseCaseRegister } from './registers';
import { DynamoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';

const cacheRepository = new DynamoDBRepository();
const logService = new LogService('AutoresHandler');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Amz-Security-Token,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,HEAD,PATCH,DELETE',
};

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logService.info('Evento recebido:', {}, { event, context });

  let cacheKey =
    event.path + (event.queryStringParameters ? JSON.stringify(event.queryStringParameters) : '');
  cacheKey = cacheKey.replace(/\s/g, '').replace(/[^a-zA-Z0-9:]/g, '_');
  cacheKey = event.httpMethod.toLowerCase() + '-' + cacheKey;

  const data: any[] = await cacheRepository.getData(process.env.TB_AUTOR_CACHE ?? 'autor-cache', {
    name: 'PageId',
    type: 'S',
    value: cacheKey,
  });

  if (data.length > 0 && data[0].content) {
    logService.info('Cache hit for key:', {}, { cacheKey });
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      body: data[0].content,
    };
  }

  const eventMethods = event.httpMethod.toLowerCase() as keyof typeof pathUseCaseRegister;
  const register =
    event.path &&
    pathUseCaseRegister[eventMethods].find((r) => {
      const keyPath = Object.keys(r)[0];
      if (keyPath.startsWith('^') && keyPath.endsWith('$') && keyPath.length > 2) {
        const regex = new RegExp(keyPath, 'gmi');
        return regex.test(event.path);
      } else {
        return event.path.toLowerCase() === keyPath.toLowerCase();
      }
    });

  if (register) {
    const keyPath = Object.keys(register)[0];
    const useCase = register[keyPath as keyof typeof register] as UseCaseInterface;

    if (useCase) {
      logService.info('Use case encontrado para o path e método correspondentes.', {
        keyPath,
        eventPath: event.path,
        httpMethod: event.httpMethod,
      });
      const data = JSON.parse(JSON.stringify(event));
      const result = await useCase.execute(data);

      if (
        result &&
        (result as any).headers &&
        (result as any).headers['Content-Disposition'].includes('attachment')
      ) {
        logService.info(
          'Resposta de download de arquivo detectada, retornando objeto de resposta completo.',
          {
            keyPath,
            eventPath: event.path,
            httpMethod: event.httpMethod,
          }
        );
        return {
          statusCode: 200,
          body: JSON.stringify(result),
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        } as APIGatewayProxyResult;
      }

      if (!result || (Array.isArray(result) && result.length === 0)) {
        logService.info('Nenhum conteúdo para retornar, enviando resposta 204 No Content.', {
          keyPath,
          eventPath: event.path,
          httpMethod: event.httpMethod,
        });
        return {
          statusCode: 204,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Message: 'No Content',
            Code: 204,
          }),
        } as APIGatewayProxyResult;
      }

      const sizeInKB = Buffer.byteLength(JSON.stringify(result), 'utf8') / 1024;
      logService.info('Response size in KB:', {}, { sizeInKB });
      try {
        await cacheRepository.saveData(process.env.TB_AUTOR_CACHE ?? 'autor-cache', {
          PageId: cacheKey,
          content: JSON.stringify(result),
          Expiration: Math.floor(Date.now() / 1000) + 3600 * 12, // Expira em 12 hora
        });
      } catch (error: unknown) {
        logService.error('Error saving data to cache:', {}, error as Error);
      }

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      } as APIGatewayProxyResult;
    }

    logService.info('Use case não encontrado para o path e método correspondentes.', {
      keyPath,
      eventPath: event.path,
      httpMethod: event.httpMethod,
    });
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ Message: 'Bad Request: Missing body or use case.', Code: 400 }),
    } as APIGatewayProxyResult;
  }

  logService.info('Nenhum registro encontrado para o path e método correspondentes.', {
    eventPath: event.path,
    httpMethod: event.httpMethod,
  });

  return {
    statusCode: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Message: 'Erro interno.', Code: 500 }),
  };
};
