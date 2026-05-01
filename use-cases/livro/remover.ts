import { LivroDTO, PageDataType, UseCaseInterface } from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createResult } from '../../utils';

export class RemoverLivroUseCase implements UseCaseInterface {
  private _tableName: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.LIVRO_TABLE_NAME || 'Livroes';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const result = await this._repository.deleteByMinhotecaId(
        this._tableName,
        data.queryStringParameters?.id ?? ''
      );
      if (result) {
        return createResult(result as LivroDTO[], 200, 'Livro removido com sucesso.');
      } else {
        return createResult([], 404, 'Nenhum livro encontrado para remoção.');
      }
    } catch (error) {
      console.error('Erro ao remover livro:', error);
      throw new Error('Falha ao remover livro.');
    }
  }
}
