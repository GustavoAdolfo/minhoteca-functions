import {
  AutorDTO,
  AutorAdapter,
  Autor,
  UseCaseInterface,
  PaisDTO,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { S3Proxy } from '../../proxies/s3.proxy';
import { createResult } from '../../utils';

export class ListarAutorUseCase implements UseCaseInterface {
  private _tableName: string;
  private _paisTableName: string;
  private _s3Proxy: any;
  private readonly caminhoFotosAutores = process.env.FOTOS_AUTORES_S3_PATH ?? 'autores/fotos/';
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.AUTOR_TABLE_NAME || 'Autores';
    this._paisTableName = process.env.PAIS_TABLE_NAME || 'Paises';

    this._s3Proxy = new S3Proxy();
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const page = parseInt(
        data.queryStringParameters?.page ?? data.queryStringParameters?.pg ?? '1',
        10
      );
      const limit = parseInt(
        data.queryStringParameters?.limit ?? data.queryStringParameters?.lt ?? '10',
        10
      );
      let sortBy = Object.keys(data.queryStringParameters ?? {}).find((key) =>
        key.startsWith('sort')
      );
      const sortOrder = sortBy ? data.queryStringParameters?.[sortBy] : 'asc';
      sortBy = sortBy ? sortBy.replace('sort', '').replace(/\[|\]/g, '').toLowerCase() : 'nome';
      let filterKey =
        Object.keys(data.queryStringParameters ?? {}).find((key) => key.startsWith('filter')) ??
        null;
      const filterValue = filterKey ? data.queryStringParameters?.[filterKey] : null;
      filterKey = filterKey
        ? filterKey.replace('filter', '').replace(/\[|\]/g, '').toLowerCase()
        : null;
      filterKey = filterKey?.includes('.') ? `[${filterKey}]` : filterKey; // Para permitir filtragem por campos aninhados

      const result: any = await this._repository.getAll<AutorDTO>(this._tableName, {
        page,
        limit,
        sortBy,
        sortOrder,
        filterKey,
        filterValue,
      });

      const resultList: PageDataType = {} as unknown as PageDataType;
      resultList.PageData = [];
      const entities = (result.data ?? []).map((autor: any) =>
        Autor.create(autor as any, (autor as any).id)
      );
      const dtos: AutorDTO[] = AutorAdapter.toDTOList(entities);

      const paises: any = await this._repository.getAll<PaisDTO>(this._paisTableName, {
        sortBy: 'isoNumeric',
        sortOrder,
      });

      if (paises?.data) {
        dtos.map(
          (dto) => (dto.pais = (paises?.data as PaisDTO[]).find((p) => p.isoNumeric === dto.idPais))
        );
      }
      const filterQuery = filterKey && filterValue ? `filter[${filterKey}]=${filterValue}` : '';
      return createResult(
        dtos,
        dtos.length > 0 ? 200 : 204,
        dtos.length > 0 ? 'Autores listados com sucesso' : 'Nenhum autor encontrado',
        {
          page: result.currentPage ?? page,
          totalItems: result.totalDocuments ?? 0,
          totalPages: result.totalPages ?? 0,
          nextPage: result.hasNextPage
            ? `?page=${result.currentPage! + 1}&limit=${limit}&sort[${sortBy}]=${sortOrder}&${filterQuery}`
            : '',
          prevPage: result.hasPrevPage
            ? `?page=${result.currentPage! - 1}&limit=${limit}&sort[${sortBy}]=${sortOrder}&${filterQuery}`
            : '',
        }
      );
      return resultList;
    } catch (error) {
      console.error('Erro ao listar autores:', error);
      throw new Error('Falha ao listar autores.');
    }
  }
}
