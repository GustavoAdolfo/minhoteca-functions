import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../../admin-function/index';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';

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
  let mockRepository: RepositoryInterface;

  beforeEach(() => {
    mockRepository = {
      saveData: jest.fn(),
      getData: jest.fn(),
      queryData: jest.fn(),
      removeData: jest.fn(),
      getAll: jest.fn(),
      updateByMinhotecaId: jest.fn(),
      deleteByMinhotecaId: jest.fn(),
      findByMinhotecaId: jest.fn(),
    };
  });

  it('deve criar editora e retornar status 201', async () => {
    const event = {
      ...defaultEvent,
      path: '/v1/admin/editora',
      resourcePath: '/v1/admin/editora',
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: '/v1/admin/editora',
        path: '/DEFAULT/v1/admin/editora',
      },
      resource: '/v1/admin/editora',
      httpMethod: 'POST',
      body: JSON.stringify({ nome: 'Editora Teste' }),
    } as unknown as APIGatewayEvent;
    const response = await handler(event, {} as Context);

    expect((response as any).statusCode).toBe(201);
    const body = JSON.parse((response as any).body);
    expect(body).toHaveProperty('Message', 'Editora criada com sucesso');
    expect(body).toHaveProperty('PageData');
    expect(Array.isArray(body.PageData)).toBe(true);
    expect(body.PageData[0]).toHaveProperty('nome', 'Editora Teste');
  });
});
