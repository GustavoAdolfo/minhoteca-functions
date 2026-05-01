import { AutorDTO, UseCaseInterface, PageDataType } from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createResult } from '../../utils';

export class RemoverAutorUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.AUTOR_TABLE_NAME || 'Autores';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const result = await this._repository.deleteByMinhotecaId(
        this._tableName,
        data.queryStringParameters?.id ?? ''
      );
      return createResult([result], 200, 'Autor removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover autor:', error);
      throw new Error('Falha ao remover autor.');
    }
  }
}
