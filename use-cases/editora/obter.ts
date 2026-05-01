import {
  EditoraDTO,
  Editora,
  PageDataType,
  EditoraAdapter,
  UseCaseInterface,
} from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils/result.utils';

export class ObterEditoraUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const editoraId = data.pathParameters?.id ?? data.queryStringParameters?.id;
      if (editoraId) {
        const attributes: KeyValueAttr[] = [
          {
            attribute: {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            attributeValue: editoraId,
            partitionKey: false,
            sortKey: false,
          },
        ];
        const result = await this._repository.queryData<EditoraDTO>(this._tableName, attributes);
        if (result) {
          const editoraEntity = Editora.create(result as any, (result as any).id);
          const resultDTO = EditoraAdapter.toDTO(editoraEntity);
          return createResult([resultDTO], 200, 'Editora obtida com sucesso.');
        }
        return createResult([], 404, 'Editora não encontrada.');
      }

      throw new Error('ID da editora não informado.');
    } catch (error) {
      console.error('Erro ao obter editora:', error);
      throw new Error('Falha ao obter editora.');
    }
  }
}
