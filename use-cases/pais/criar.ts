import {
  PaisDTO,
  PaisAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils';

export class CriarPaisUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.PAIS_TABLE_NAME || 'Paises';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const body = JSON.parse(data.body ?? '{}');
      const dto = body as PaisDTO;

      const entity = PaisAdapter.fromCreateDTO(dto);
      const rawEntity = entity.toJSONString();
      await this._repository.saveData(this._tableName, JSON.parse(rawEntity));
      const paisDTO = PaisAdapter.toDTO(entity);

      const result: PageDataType = createResult([paisDTO], 201, 'Pais criado com sucesso');
      return result;
    } catch (error) {
      console.error('Erro ao criar pais:', error);
      throw new Error('Falha ao criar pais.');
    }
  }
}
