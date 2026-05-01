import {
  AutorDTO,
  AutorAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createResult } from '../../utils/result.utils';

export class CriarAutorUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.AUTOR_TABLE_NAME || 'Autores';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const body = JSON.parse(data.body ?? '{}');
      const dto = body as AutorDTO;
      const entity = AutorAdapter.fromCreateDTO(dto);
      const autorDTO = AutorAdapter.toDTO(entity);
      await this._repository.saveData(this._tableName, autorDTO);
      return createResult([autorDTO], 201, 'Autor criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar autor:', error);
      throw new Error('Falha ao criar autor.');
    }
  }
}
