import {
  Pais,
  PaisAdapter,
  PaisDTO,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils';

export class ListarPaisUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.PAIS_TABLE_NAME || 'Paises';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const page = data.queryStringParameters?.page
        ? parseInt(data.queryStringParameters.page, 10)
        : 0; // listar tudo
      const limit = data.queryStringParameters?.limit
        ? parseInt(data.queryStringParameters.limit, 10)
        : 10;
      const sortBy = data.queryStringParameters?.sortBy || 'nomePortugues';
      const sortOrder = data.queryStringParameters?.sortOrder || 'asc';
      const result: any = await this._repository.getAll<PaisDTO>(this._tableName, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      const entities = result.data.map((item: any) => Pais.create(item as any));
      const dtoList = PaisAdapter.toDTOList(entities);
      const httpCode = dtoList.length > 0 ? 200 : 204;
      const pageDataResult = createResult(
        dtoList,
        httpCode,
        'Lista de países obtida com sucesso.',
        {
          totalItems: result.totalDocuments ?? 0,
          page: result.currentPage ?? page,
          totalPages: result.totalPages ?? 0,
          ...(result.hasNextPage && {
            nextPage: `/paises/?page=${(result.currentPage ?? page) + 1}&limit=${limit}${sortBy && sortOrder ? `&sort[${sortBy}]=${sortOrder}` : ''}`,
          }),
          ...(result.hasPrevPage && {
            prevPage: `/paises/?page=${(result.currentPage ?? page) - 1}&limit=${limit}${sortBy && sortOrder ? `&sort[${sortBy}]=${sortOrder}` : ''}`,
          }),
        }
      );

      return pageDataResult;
    } catch (error) {
      console.error('Erro ao listar paises:', error);
      throw new Error('Falha ao listar paises.');
    }
  }
}
