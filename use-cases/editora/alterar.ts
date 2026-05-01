import {
  EditoraDTO,
  EditoraAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils/result.utils';

export class AlterarEditoraUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const dto = JSON.parse(data.body || '{}') as EditoraDTO;
      if (!dto.id || dto.id.trim() === '') {
        throw new Error('ID da editora é obrigatório para alteração.');
      }

      const entity = EditoraAdapter.fromCreateDTO(dto);
      // const editoraDTO = EditoraAdapter.toDTO(entity);
      const editoraDTO = await this._repository.updateByMinhotecaId(
        this._tableName,
        JSON.parse(entity.toJSONString()),
        dto.id
      );

      return createResult([editoraDTO], 200, 'Editora alterada com sucesso');
    } catch (error) {
      console.error('Erro ao alterar editora:', error);
      throw new Error('Falha ao alterar editora.');
    }
  }
}
