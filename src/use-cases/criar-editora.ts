import {
  EditoraDTO,
  Editora,
  Nome,
  Email,
  EditoraAdapter,
} from '@gustavoadolfo/minhoteca-core-layer';
import { DynamoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';

export class CriarEditoraUseCase {
  private _tableName: string;
  /**
   *
   */
  constructor() {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent) {
    try {
      const body = JSON.parse(data.body ?? '{}');
      const dto = body as EditoraDTO;
      const entity = Editora.create({
        nome: new Nome(dto.nome),
        ...(dto.email && { email: new Email(dto.email) }),
        ...(dto.website && { website: dto.website }),
        ...(dto.pais && { pais: dto.pais }),
      });
      const repository = new DynamoDBRepository();
      const editoraDTO = EditoraAdapter.toDTO(entity);
      const response = await repository.saveData(this._tableName, editoraDTO);

      return { message: 'Editora salvo com sucesso!', data: editoraDTO };
    } catch (error) {
      console.error('Erro ao criar editora:', error);
      throw new Error('Falha ao criar editora.');
    }
  }
}
