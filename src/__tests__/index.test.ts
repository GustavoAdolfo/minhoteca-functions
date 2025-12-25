import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../index';
import { DynamoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';

// Mock do DynamoDBRepository
jest.mock('@gustavoadolfo/minhoteca-adapter-layer', () => ({
  DynamoDBRepository: jest.fn().mockImplementation(() => ({
    saveData: jest.fn().mockResolvedValue(undefined),
  })),
}));

const defaultEvent = {
  body: null,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0',
    'x-api-key': 'xxxxxxxxxxxxxxxxxxx',
  },
  httpMethod: 'GET',
  isBase64Encoded: false,
  multiValueHeaders: {
    Accept: ['application/json, text/plain, */*'],
    'Accept-Encoding': ['gzip, deflate, br, zstd'],
    'Accept-Language': ['pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3'],
    Host: ['gtc1jacwp6.execute-api.us-east-1.amazonaws.com'],
    'User-Agent': ['Mozilla/5.0 (X11; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0'],
    'x-api-key': ['xxxxxxxxxxxxxxxxxxx'],
  },
  multiValueQueryStringParameters: {},
  path: '/v1/xxxx',
  pathParameters: {},
  queryStringParameters: {},
  requestContext: {
    accountId: '000000000000',
    apiId: '',
    deploymentId: '',
    domainName: '',
    domainPrefix: '',
    extendedRequestId: '',
    httpMethod: 'GET',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: 'xxxxxxxxxxxxxxxxxxx',
      apiKeyId: '',
      caller: null,
      user: null,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0',
      userArn: null,
    },
    path: '/DEFAULT/v1/xxx',
    protocol: 'HTTP/1.1',
    requestId: '51fa940d-46a8-4a63-a237-f3cf901947dc',
    requestTime: '13/Dec/2025:17:19:21 +0000',
    requestTimeEpoch: 1765646361786,
    resourceId: 'abcdefg',
    resourcePath: '/v1/xxxxxx',
    stage: 'DEFAULT',
  },
  resource: '/v1/xxxxxx',
  stageVariables: null,
};

describe('Minhoteca Admin Function Handler', () => {
  it('deve salvar editora e retornar status 200', async () => {
    const event = {
      ...defaultEvent,
      path: '/v1/editora',
      resourcePath: '/v1/editora',
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: '/v1/editora',
      },
      resource: '/v1/editora',
      httpMethod: 'POST',
      body: JSON.stringify({ nome: 'Editora Teste' }),
    } as unknown as APIGatewayEvent;
    const response = await handler(event, {} as Context);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('message', 'Editora salvo com sucesso!');
    console.log({ body });
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('nome');
  });
});
