import { PageDataType, PaisDTO, UseCaseInterface } from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils';

export class RemoverPaisUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.PAIS_TABLE_NAME || 'Paises';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const result = await this._repository.deleteByMinhotecaId(
        this._tableName,
        data.queryStringParameters?.id ?? ''
      );
      return createResult(result as PaisDTO[], 200, 'País removido com sucesso.');
    } catch (error) {
      console.error('Erro ao remover pais:', error);
      throw new Error('Falha ao remover pais.');
    }
  }
}
