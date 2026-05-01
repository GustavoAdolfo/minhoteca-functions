import {
  AutorDTO,
  AutorAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createResult } from '../../utils/result.utils';

export class AlterarAutorUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.AUTOR_TABLE_NAME || 'Autores';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const dto = JSON.parse(data.body || '{}') as AutorDTO;
      if (!dto.id || dto.id.trim() === '') {
        throw new Error('ID do autor é obrigatório para alteração.');
      }

      const entity = AutorAdapter.fromCreateDTO(dto);
      const autorDTO = AutorAdapter.toDTO(entity);
      delete autorDTO.nome;
      await this._repository.updateByMinhotecaId(this._tableName, autorDTO, autorDTO.id!);

      return createResult([autorDTO], 200, 'Autor alterado com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar autor:', error);
      throw new Error('Falha ao alterar autor.');
    }
  }
}
