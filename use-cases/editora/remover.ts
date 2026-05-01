import { EditoraDTO, PageDataType, UseCaseInterface } from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils/result.utils';
import { create } from 'node:domain';

export class RemoverEditoraUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const dto = await this._repository.deleteByMinhotecaId(
        this._tableName,
        data.queryStringParameters?.id ?? ''
      );
      return createResult([dto], 200, 'Editora removida com sucesso.');
    } catch (error) {
      console.error('Erro ao remover editora:', error);
      throw new Error('Falha ao remover editora.');
    }
  }
}
