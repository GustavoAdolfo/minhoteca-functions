import {
  EditoraDTO,
  EditoraAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils/result.utils';

export class CriarEditoraUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const body = JSON.parse(data.body ?? '{}');
      const dto = body as EditoraDTO;

      const entity = EditoraAdapter.fromCreateDTO(dto);
      await this._repository.saveData(this._tableName, JSON.parse(entity.toJSONString()));
      const editoraDTO = EditoraAdapter.toDTO(entity);

      return createResult([editoraDTO], 201, 'Editora criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar editora:', error);
      throw new Error('Falha ao criar editora.');
    }
  }
}
