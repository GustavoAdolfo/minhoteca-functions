import { APIGatewayEvent, Context } from 'aws-lambda';
import {
  AlterarEditoraUseCase,
  CriarAutorUseCase,
  CriarEditoraUseCase,
  CriarLivroUseCase,
  CriarUsuarioUseCase,
  ObterEditoraUseCase,
  // ObterAutorUseCase,
  // ObterLivroUseCase,
  // ObterUsuarioUseCase,
} from './use-cases';

const pathUseCaseRegister = {
  post: [
    { '/v1/livro': new CriarLivroUseCase() },
    { '/v1/autor': new CriarAutorUseCase() },
    { '/v1/editora': new CriarEditoraUseCase() },
    { '/v1/usuario': new CriarUsuarioUseCase() },
  ],
  get: [
    { '/v1/editora': new ObterEditoraUseCase() },
    // { '/v1/livro': new ObterLivroUseCase() },
    // { '/v1/autor': new ObterAutorUseCase() },
    // { '/v1/usuario': new ObterUsuarioUseCase() },
  ],
  put: [
    { '/v1/editora': new AlterarEditoraUseCase() },
    // { '/v1/livro': new AlterarLivroUseCase() },
    // { '/v1/autor': new AlterarAutorUseCase() },
    // { '/v1/usuario': new AlterarUsuarioUseCase() },
  ],
  delete: [],
};

export const handler = async (event: APIGatewayEvent, context: Context) => {
  const eventMethods = event.httpMethod.toLowerCase() as keyof typeof pathUseCaseRegister;
  console.log('===>>> Event method:', eventMethods, 'Resource path:', event.path);
  const register =
    event.path &&
    pathUseCaseRegister[eventMethods].find((r) => event.path.startsWith(Object.keys(r)[0]));
  console.log('===>>> Register found:', register ? Object.keys(register)[0] : 'None');
  if (register) {
    const useCase = register[event.path as keyof typeof register];
    console.log('===>>> Use case found for path:', useCase ? useCase.constructor.name : 'None');
    if (useCase) {
      const data = JSON.parse(JSON.stringify(event));
      const result = await useCase.execute(data);
      console.log('===>>> Use case result:', result);
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request: Missing body or use case.' }),
    };
  }
  return {
    statusCode: 500,
    body: JSON.stringify({ message: 'Erro interno.' }),
  };
};
