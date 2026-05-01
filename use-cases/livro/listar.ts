import {
  LivroDTO,
  LivroAdapter,
  Livro,
  UseCaseInterface,
  AutorDTO,
  EditoraDTO,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda';
import { S3Proxy } from '../../proxies/s3.proxy';
import { createResult } from '../../utils';

export class ListarLivrosUseCase implements UseCaseInterface {
  private _tableName: string;
  private _tableNameAutor: string;
  private _tableNameEditora: string;
  private _s3Proxy: any;
  private readonly caminhoFotosLivros = process.env.FOTOS_LIVROS_S3_PATH ?? 'livros/fotos/';
  /**
   *
   */
  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.LIVRO_TABLE_NAME || 'Livros';
    this._tableNameAutor = process.env.AUTOR_TABLE_NAME || 'Autores';
    this._tableNameEditora = process.env.EDITORA_TABLE_NAME || 'Editoras';
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
      sortBy = sortBy ? sortBy.replace('sort', '').replace(/\[|\]/g, '') : 'nome';
      let filterKey =
        Object.keys(data.queryStringParameters ?? {}).find((key) => key.startsWith('filter')) ??
        null;
      const filterValue = filterKey ? data.queryStringParameters?.[filterKey] : null;
      filterKey = filterKey ? filterKey.replace('filter', '').replace(/\[|\]/g, '') : null;
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
        Livro.create(autor as any, (autor as any).id)
      );
      const dtos: LivroDTO[] = LivroAdapter.toDTOList(entities);

      const { autores, editoras } = await Promise.all([
        this._repository.getAll<AutorDTO>(this._tableNameAutor, {
          sortBy: 'nome',
          sortOrder,
        }),
        this._repository.getAll<EditoraDTO>(this._tableNameEditora, {
          sortBy: 'nome',
          sortOrder,
        }),
      ]).then(([autoresResult, editorasResult]) => ({
        autores: autoresResult ?? [],
        editoras: editorasResult ?? [],
      }));

      if (autores?.length > 0) {
        dtos.map((dto) => (dto.autor = (autores as AutorDTO[]).find((a) => a.id === dto.autorId)));
      }

      if (editoras?.length > 0) {
        dtos.map(
          (dto) => (dto.editora = (editoras as EditoraDTO[]).find((e) => e.id === dto.editoraId))
        );
      }

      return createResult(
        dtos,
        dtos.length > 0 ? 200 : 204,
        'Lista de livros obtida com sucesso.',
        {
          totalItems: result.totalDocuments ?? 0,
          page: result.currentPage ?? page,
          totalPages: result.totalPages ?? 0,
          ...(result.hasNextPage && {
            nextPage: `?page=${(result.currentPage ?? page) + 1}&limit=${limit}${sortBy && sortOrder ? `&sort[${sortBy}]=${sortOrder}` : ''}${filterKey && filterValue ? `&filter[${filterKey}]=${filterValue}` : ''}`,
          }),
          ...(result.hasPrevPage && {
            prevPage: `?page=${(result.currentPage ?? page) - 1}&limit=${limit}${sortBy && sortOrder ? `&sort[${sortBy}]=${sortOrder}` : ''}${filterKey && filterValue ? `&filter[${filterKey}]=${filterValue}` : ''}`,
          }),
        }
      );
    } catch (error) {
      console.error('Erro ao listar autores:', error);
      throw new Error('Falha ao listar autores.');
    }
  }
}
