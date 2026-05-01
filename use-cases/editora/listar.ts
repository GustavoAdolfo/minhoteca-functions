import {
  Editora,
  EditoraAdapter,
  EditoraDTO,
  UseCaseInterface,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { createResult } from '../../utils/result.utils';

export class ListarEditoraUseCase implements UseCaseInterface {
  private _tableName: string;
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.EDITORA_TABLE_NAME || 'Editoras';
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const page = data.queryStringParameters?.page
        ? parseInt(data.queryStringParameters.page, 10)
        : 1;
      const limit = data.queryStringParameters?.limit
        ? parseInt(data.queryStringParameters.limit, 10)
        : 10;
      const sortBy = data.queryStringParameters?.sortBy || 'nome';
      const sortOrder = data.queryStringParameters?.sortOrder || 'asc';
      const result: any = await this._repository.getAll<EditoraDTO>(this._tableName, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      const resultList: any = {};
      const entities = result.data.map((item: any) =>
        Editora.create(item as any, (item as any).id ?? '')
      );

      const editoras: EditoraDTO[] = EditoraAdapter.toDTOList(entities);
      return createResult(
        editoras,
        editoras.length > 0 ? 200 : 204,
        editoras.length > 0 ? 'Editoras listadas com sucesso' : 'Nenhuma editora encontrada',
        {
          page: result.currentPage ?? page,
          totalItems: result.totalItems ?? editoras.length,
          totalPages: result.totalPages ?? 0,
          nextPage: `?page=${result.nextPage ?? page + 1}&limit=${limit}${sortBy && sortOrder ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ''}`,
          prevPage: `?page=${result.prevPage ?? page - 1}&limit=${limit}${sortBy && sortOrder ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ''}`,
        }
      );
    } catch (error) {
      console.error('Erro ao listar editoras:', error);
      throw new Error('Falha ao listar editoras.');
    }
  }
}
