import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../../admin-function/index';

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

describe('Editora Use Cases', () => {
  it('deve salvar editora e retornar status 201', async () => {
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

  it('deve obter editora e retornar status 200', async () => {
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
      body: JSON.stringify({ nome: 'Editora Para Recuperar' }),
    } as unknown as APIGatewayEvent;

    const response = await handler(event, {} as Context);
    const data = JSON.parse((response as any).body).PageData[0];

    const eventGET = {
      ...defaultEvent,
      body: null,
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: `/v1/admin/editora/${data.id}`,
      pathParameters: { id: data.id },
      queryStringParameters: { id: data.id },
      requestContext: {
        ...defaultEvent.requestContext,
        path: `/v1/admin/editora/${data.id}`,
        resourcePath: `/v1/admin/editora/${data.id}`,
      },
      resource: `/v1/admin/editora/${data.id}`,
    } as unknown as APIGatewayEvent;

    const responseGET = await handler(eventGET, {} as Context);

    expect((responseGET as any).statusCode).toBe(200);
    const body = JSON.parse((responseGET as any).body);
    expect(body).toHaveProperty('Message', 'Editora obtida com sucesso.');
    expect(body).toHaveProperty('PageData');
    expect(body.PageData[0]).toHaveProperty('id', data.id);
  });

  it('deve alterar editora e retornar status 200', async () => {
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
      body: JSON.stringify({ nome: 'Editora Para Recuperar' }),
    } as unknown as APIGatewayEvent;

    const response = await handler(event, {} as Context);
    const data = JSON.parse((response as any).body).PageData[0];

    const eventUpdate = {
      ...defaultEvent,
      path: `/v1/admin/editora/${data.id}`,
      resourcePath: `/v1/admin/editora/${data.id}`,
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: `/v1/admin/editora/${data.id}`,
        path: `/DEFAULT/v1/admin/editora/${data.id}`,
      },
      resource: `/v1/admin/editora/${data.id}`,
      httpMethod: 'PUT',
      body: JSON.stringify({
        id: data.id,
        nome: 'Editora Alterada',
      }),
    } as unknown as APIGatewayEvent;

    const responseUpdate = await handler(eventUpdate, {} as Context);
    expect((responseUpdate as any).statusCode).toBe(200);
    const body = JSON.parse((responseUpdate as any).body);

    expect(body).toHaveProperty('Message', 'Editora alterada com sucesso');
    expect(body).toHaveProperty('PageData');
    expect(body.PageData[0]).toHaveProperty('id', data.id);
    expect(body.PageData[0]).toHaveProperty('nome', 'Editora Alterada');
  });

  it('deve remover editora e retornar status 200', async () => {
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
      body: JSON.stringify({ nome: 'Editora Para Recuperar' }),
    } as unknown as APIGatewayEvent;

    const response = await handler(event, {} as Context);
    const data = JSON.parse((response as any).body).PageData[0];

    const eventDelete = {
      ...defaultEvent,
      body: JSON.stringify({ nome: 'Editora Para Recuperar' }),
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      multiValueQueryStringParameters: {
        id: [data.id],
      },
      path: `/v1/admin/editora/${data.id}`,
      pathParameters: { id: data.id },
      queryStringParameters: {
        id: data.id,
      },
      requestContext: {
        ...defaultEvent.requestContext,
        path: `/v1/admin/editora/${data.id}`,
        resourcePath: `/v1/admin/editora/${data.id}`,
      },
      resource: `/v1/admin/editora/${data.id}`,
    } as unknown as APIGatewayEvent;

    const responseDelete = await handler(eventDelete, {} as Context);
    expect((responseDelete as any).statusCode).toBe(200);
    const body = JSON.parse((responseDelete as any).body);

    expect(body).toHaveProperty('Message', 'Editora removida com sucesso.');
    expect(body).toHaveProperty('PageData');
    expect(body.PageData[0]).toHaveProperty('deletedCount', 1);
  });
});

describe('Autor Use Cases', () => {
  it('deve salvar autor e retornar status 201', async () => {
    const event = {
      ...defaultEvent,
      path: '/v1/admin/autor',
      resourcePath: '/v1/admin/autor',
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: '/v1/admin/autor',
        path: '/DEFAULT/v1/admin/autor',
      },
      resource: '/v1/admin/autor',
      httpMethod: 'POST',
      body: JSON.stringify({ nome: 'Autor Teste' }),
    } as unknown as APIGatewayEvent;

    const response = await handler(event, {} as Context);

    expect((response as any).statusCode).toBe(201);
    const body = JSON.parse((response as any).body);
    expect(body).toHaveProperty('Message', 'Autor criado com sucesso');
    expect(body).toHaveProperty('PageData');
    expect(Array.isArray(body.PageData)).toBe(true);
    expect(body.PageData[0]).toHaveProperty('nome', 'Autor Teste');
  });

  it('deve obter autor e retornar status 200', async () => {
    const event = {
      ...defaultEvent,
      path: '/v1/admin/autor',
      resourcePath: '/v1/admin/autor',
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: '/v1/admin/autor',
        path: '/DEFAULT/v1/admin/autor',
      },
      resource: '/v1/admin/autor',
      httpMethod: 'POST',
      body: JSON.stringify({ nome: 'Autor Para Recuperar' }),
    } as unknown as APIGatewayEvent;

    const response = await handler(event, {} as Context);
    const data = JSON.parse((response as any).body).PageData[0];

    const eventGET = {
      ...defaultEvent,
      body: null,
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: `/v1/admin/autor/${data.id}`,
      pathParameters: { id: data.id },
      queryStringParameters: { id: data.id },
      requestContext: {
        ...defaultEvent.requestContext,
        path: `/v1/admin/autor/${data.id}`,
        resourcePath: `/v1/admin/autor/${data.id}`,
      },
      resource: `/v1/admin/autor/${data.id}`,
    } as unknown as APIGatewayEvent;

    const responseGET = await handler(eventGET, {} as Context);

    expect((responseGET as any).statusCode).toBe(200);
    const body = JSON.parse((responseGET as any).body);
    expect(body).toHaveProperty('Message', 'Autor obtido com sucesso');
    expect(body).toHaveProperty('PageData');
    expect(body.PageData[0]).toHaveProperty('id', data.id);
  });

  it('deve alterar autor e retornar status 200', async () => {
    const event = {
      ...defaultEvent,
      path: '/v1/admin/autor',
      resourcePath: '/v1/admin/autor',
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: '/v1/admin/autor',
        path: '/DEFAULT/v1/admin/autor',
      },
      resource: '/v1/admin/autor',
      httpMethod: 'POST',
      body: JSON.stringify({ nome: 'Autor Para Recuperar' }),
    } as unknown as APIGatewayEvent;

    const response = await handler(event, {} as Context);
    const data = JSON.parse((response as any).body).PageData[0];

    const eventUpdate = {
      ...defaultEvent,
      path: `/v1/admin/autor/${data.id}`,
      resourcePath: `/v1/admin/autor/${data.id}`,
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: `/v1/admin/autor/${data.id}`,
        path: `/DEFAULT/v1/admin/autor/${data.id}`,
      },
      resource: `/v1/admin/autor/${data.id}`,
      httpMethod: 'PUT',
      body: JSON.stringify({
        id: data.id,
        nome: 'Autor Alterado',
      }),
    } as unknown as APIGatewayEvent;

    const responseUpdate = await handler(eventUpdate, {} as Context);
    expect((responseUpdate as any).statusCode).toBe(200);
    const body = JSON.parse((responseUpdate as any).body);

    expect(body).toHaveProperty('Message', 'Autor alterado com sucesso!');
    expect(body).toHaveProperty('PageData');
    expect(body.PageData[0]).toHaveProperty('id', data.id);
  });

  it('deve remover autor e retornar status 200', async () => {
    const event = {
      ...defaultEvent,
      path: '/v1/admin/autor',
      resourcePath: '/v1/admin/autor',
      requestContext: {
        ...defaultEvent.requestContext,
        resourcePath: '/v1/admin/autor',
        path: '/DEFAULT/v1/admin/autor',
      },
      resource: '/v1/admin/autor',
      httpMethod: 'POST',
      body: JSON.stringify({ nome: 'Autor Para Recuperar' }),
    } as unknown as APIGatewayEvent;

    const response = await handler(event, {} as Context);
    const data = JSON.parse((response as any).body).PageData[0];

    const eventDelete = {
      ...defaultEvent,
      body: JSON.stringify({ nome: 'Autor Para Recuperar' }),
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      multiValueQueryStringParameters: {
        id: [data.id],
      },
      path: `/v1/admin/autor/${data.id}`,
      pathParameters: { id: data.id },
      queryStringParameters: {
        id: data.id,
      },
      requestContext: {
        ...defaultEvent.requestContext,
        path: `/v1/admin/autor/${data.id}`,
        resourcePath: `/v1/admin/autor/${data.id}`,
      },
      resource: `/v1/admin/autor/${data.id}`,
    } as unknown as APIGatewayEvent;

    const responseDelete = await handler(eventDelete, {} as Context);
    expect((responseDelete as any).statusCode).toBe(200);
    const body = JSON.parse((responseDelete as any).body);

    expect(body).toHaveProperty('Message', 'Autor removido com sucesso');
    expect(body).toHaveProperty('PageData');
    expect(body.PageData[0]).toHaveProperty('deletedCount', 1);
  });
});
