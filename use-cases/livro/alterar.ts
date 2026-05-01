import {
  LivroDTO,
  LivroAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createResult } from '../../utils';

export class AlterarLivroUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.LIVRO_TABLE_NAME || 'Livroes';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const dto = JSON.parse(data.body || '{}') as LivroDTO;
      if (!dto.id || dto.id.trim() === '') {
        throw new Error('ID do livro é obrigatório para alteração.');
      }

      const entity = LivroAdapter.fromCreateDTO(dto);
      const livroDTO = LivroAdapter.toDTO(entity);
      await this._repository.updateByMinhotecaId(this._tableName, livroDTO, dto.id);
      const result = createResult([livroDTO], 200, 'Livro alterado com sucesso!');
      return result;
    } catch (error) {
      console.error('Erro ao alterar livro:', error);
      throw new Error('Falha ao alterar livro.');
    }
  }
}
