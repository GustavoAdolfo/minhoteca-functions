import {
  PaisDTO,
  PaisAdapter,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils';

export class AlterarPaisUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.PAIS_TABLE_NAME || 'Paises';
  }

  async execute(data: APIGatewayEvent) {
    try {
      const dto = JSON.parse(data.body || '{}') as PaisDTO;
      if (!dto.isoNumeric || dto.isoNumeric <= 0) {
        throw new Error('Código ISO do país é obrigatório para alteração.');
      }

      const entity = PaisAdapter.fromCreateDTO(dto);
      const rawEntity = entity.toJSONString();

      const paisDTO = await this._repository.updateByMinhotecaId(
        this._tableName,
        JSON.parse(rawEntity),
        dto.isoNumeric.toString()
      );

      const resultDTO = PaisAdapter.toDTO(paisDTO);

      return createResult([resultDTO], 200, 'Pais alterado com sucesso');
    } catch (error) {
      console.error('Erro ao alterar país:', { error });
      throw new Error('Falha ao alterar país.');
    }
  }
}
