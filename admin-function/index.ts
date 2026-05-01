import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UseCaseInterface, LogService } from '@gustavoadolfo/minhoteca-core-layer';
import { pathUseCaseRegister } from './registers';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Amz-Security-Token,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,HEAD,PATCH,DELETE',
};

const logService = new LogService('AdminHandler');

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logService.info('Evento recebido:', {}, { event, context });

  const eventMethods = event.httpMethod.toLowerCase() as keyof typeof pathUseCaseRegister;

  const register =
    event.path &&
    pathUseCaseRegister[eventMethods].find((r) => {
      const keyPath = Object.keys(r)[0];
      logService.info('Buscando path correspondente para criação do use case.', {
        eventPath: event.path,
        keyPath,
      });
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
          { keyPath, eventPath: event.path, httpMethod: event.httpMethod }
        );
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
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
          body: JSON.stringify({ message: 'No Content' }),
        } as APIGatewayProxyResult;
      }

      logService.info('Retornando resposta bem-sucedida com dados.', {
        keyPath,
        eventPath: event.path,
        httpMethod: event.httpMethod,
      });
      return {
        statusCode: event.httpMethod.toLowerCase() === 'post' ? 201 : 200,
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
      body: JSON.stringify({ message: 'Bad Request: Missing body or use case.' }),
    } as APIGatewayProxyResult;
  }

  logService.info('Nenhum registro encontrado para o path e método correspondentes.', {
    eventPath: event.path,
    httpMethod: event.httpMethod,
  });
  return {
    statusCode: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Erro interno.' }),
  } as APIGatewayProxyResult;
};
