import {
  EditoraDTO,
  Editora,
  Nome,
  Email,
  EditoraAdapter,
} from '@gustavoadolfo/minhoteca-core-layer';
import { DynamoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';

export class AlterarEditoraUseCase {
  private _tableName: string;
  /**
   *
   */
  constructor() {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent) {
    try {
      const dto = JSON.parse(data.body || '{}') as EditoraDTO;
      if (!dto.id || dto.id.trim() === '') {
        throw new Error('ID da editora é obrigatório para alteração.');
      }

      const entity = Editora.create(
        {
          nome: new Nome(dto.nome),
          ...(dto.email && { email: new Email(dto.email) }),
          ...(dto.website && { website: dto.website }),
          ...(dto.pais && { pais: dto.pais }),
        },
        dto.id
      );
      const repository = new DynamoDBRepository();
      const editoraDTO = EditoraAdapter.toDTO(entity);
      await repository.saveData(this._tableName, editoraDTO);

      return { message: 'Editora alterada com sucesso!', data: editoraDTO };
    } catch (error) {
      console.error('Erro ao alterar editora:', error);
      throw new Error('Falha ao alterar editora.');
    }
  }
}
