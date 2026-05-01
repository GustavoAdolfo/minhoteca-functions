import {
  PaisDTO,
  Pais,
  PaisAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils';

export class ObterPaisUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.PAIS_TABLE_NAME || 'Paises';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const paisId = data.pathParameters?.id ?? data.queryStringParameters?.id;
      if (paisId) {
        const attributes: KeyValueAttr[] = [
          {
            attribute: {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            attributeValue: paisId,
            partitionKey: false,
            sortKey: false,
          },
        ];
        const result = await this._repository.queryData<PaisDTO>(this._tableName, attributes);

        const resultPageData = createResult(
          result,
          result?.length ? 200 : 404,
          result?.length ? 'País encontrado.' : 'País não encontrado.'
        );
        return resultPageData;
      }

      throw new Error('ID do país não informado.');
    } catch (error) {
      console.error('Erro ao obter país:', error);
      throw new Error('Falha ao obter país.');
    }
  }
}
