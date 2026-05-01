import {
  AutorAdapter,
  AutorDTO,
  Autor,
  UseCaseInterface,
  LivroDTO,
  PageDataType,
} from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { S3Proxy } from '../../proxies/s3.proxy';
import { createResult } from '../../utils';

export class ObterAutorUseCase implements UseCaseInterface {
  private _tableName: string;
  private _s3Proxy: S3Proxy;
  private _bucketResources: string;
  private _livroTableName: string;
  private readonly caminhoFotosAutores = process.env.FOTOS_AUTORES_S3_PATH ?? 'autores/imgs/';

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.AUTOR_TABLE_NAME ?? 'Autores';
    this._s3Proxy = new S3Proxy();
    this._bucketResources = process.env.S3_BUCKET_RESOURCES ?? 'minhoteca-resources';
    this._livroTableName = process.env.LIVRO_TABLE_NAME || 'Livros';
  }

  #getContentTypeForImage(imageKey: string): string {
    const extension = imageKey.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'tiff':
      case 'tif':
        return 'image/tiff';
      default:
        return 'application/octet-stream'; // Tipo genérico para arquivos desconhecidos
    }
  }

  async execute(data: APIGatewayEvent): Promise<PageDataType> {
    try {
      const autorId = data.pathParameters?.id ?? data.queryStringParameters?.id;
      if (autorId) {
        const attributes: KeyValueAttr[] = [
          {
            attribute: {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            attributeValue: autorId,
            partitionKey: false,
            sortKey: false,
          },
        ];
        const result = await this._repository.queryData<AutorDTO>(this._tableName, attributes);
        if (result) {
          const autorEntity = Autor.create(result as any, (result as any).id);
          const dto = AutorAdapter.toDTO(autorEntity);
          if (dto.imagemDispositivos) {
            dto.imagemDispositivos = await this._s3Proxy.createPreSignedUrlGet(
              this._bucketResources,
              `${this.caminhoFotosAutores}${dto.imagemDispositivos}`,
              this.#getContentTypeForImage(dto.imagemDispositivos)
            );
          }
          if (dto.imagemPadrao) {
            dto.imagemPadrao = await this._s3Proxy.createPreSignedUrlGet(
              this._bucketResources,
              `${this.caminhoFotosAutores}${dto.imagemPadrao}`,
              this.#getContentTypeForImage(dto.imagemPadrao)
            );
          }

          const livros: any = await this._repository.getAll<LivroDTO>(this._livroTableName, {
            sortBy: 'titulo',
            sortOrder: 'asc',
            filterKey: 'autorId',
            filterValue: dto.id,
          });
          if (livros?.data) {
            dto.livros = (livros.data as LivroDTO[]).reduce((acc: LivroDTO[], livro: LivroDTO) => {
              acc.push({
                id: livro.id,
                titulo: livro.titulo,
                ...(livro.subtitulo ? { subtitulo: livro.subtitulo } : {}),
              } as unknown as LivroDTO);
              return acc;
            }, [] as LivroDTO[]);
          }

          return createResult([dto], 200, 'Autor obtido com sucesso');
        }
        return createResult([], 404, 'Autor não encontrado');
      }

      throw new Error('ID do autor não informado.');
    } catch (error) {
      console.error('Erro ao obter autor:', error);
      throw new Error('Falha ao obter autor.');
    }
  }
}
