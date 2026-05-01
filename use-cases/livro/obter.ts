import {
  LivroAdapter,
  LivroDTO,
  Livro,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createResult } from '../../utils';

export class ObterLivroUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.LIVRO_TABLE_NAME ?? 'Livros';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const livroId = data.pathParameters?.id ?? data.queryStringParameters?.id;
      if (livroId) {
        const attributes: KeyValueAttr[] = [
          {
            attribute: {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            attributeValue: livroId,
            partitionKey: false,
            sortKey: false,
          },
        ];
        const result = await this._repository.queryData<LivroDTO>(this._tableName, attributes);
        return createResult(
          result,
          result?.length ? 200 : 404,
          result?.length ? 'Livro encontrado.' : 'Livro não encontrado.',
          {
            ...(result && result.length > 0 && { totalItems: 1 }),
            ...(result && result.length > 0 && { totalPages: 1 }),
            ...(result && result.length > 0 && { page: 1 }),
          }
        );
      }

      throw new Error('ID do livro não informado.');
    } catch (error) {
      console.error('Erro ao obter livro:', error);
      throw new Error('Falha ao obter livro.');
    }
  }
}
