import {
  EditoraDTO,
  Editora,
  Nome,
  Email,
  EditoraAdapter,
} from '@gustavoadolfo/minhoteca-core-layer';
import { DynamoDBRepository, DynamoDBKeyValueAttr } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';

export class ObterEditoraUseCase {
  private _tableName: string;
  /**
   *
   */
  constructor() {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent) {
    try {
      if (data.queryStringParameters?.id) {
        console.log('===>>> ObterEditoraUseCase - ID parameter:', data.queryStringParameters.id);
        const repository = new DynamoDBRepository();
        const attributes: DynamoDBKeyValueAttr[] = [
          {
            attribute: {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            attributeValue: data.queryStringParameters.id,
            partitionKey: false,
            sortKey: false,
          },
        ];
        const result = await repository.queryData<EditoraDTO>(this._tableName, attributes);
        return { message: 'Dados obtidos com sucesso!', data: result };
      }
    } catch (error) {
      console.error('Erro ao obter editora:', error);
      throw new Error('Falha ao obter editora.');
    }
  }
}
