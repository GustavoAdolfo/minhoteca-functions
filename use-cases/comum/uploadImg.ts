import { UseCaseInterface, PageDataType } from '@gustavoadolfo/minhoteca-core-layer';
import { KeyValueAttr, RepositoryInterface } from '@gustavoadolfo/minhoteca-adapter-layer';
import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { S3Proxy } from '../../proxies/s3.proxy';
import { createResult } from '../../utils';

export class UploadImgUseCase implements UseCaseInterface {
  private _tableName: string;
  private _s3Proxy: S3Proxy;
  private _bucketResources: string;
  private _prefixoImagemDispositivos: string;
  private _prefixoImagemPadrao: string;

  constructor(private _repository: RepositoryInterface) {
    this._tableName = process.env.AUTOR_TABLE_NAME ?? 'Autores';
    this._s3Proxy = new S3Proxy();
    this._bucketResources = process.env.S3_BUCKET_RESOURCES ?? 'minhoteca-resources';
    this._prefixoImagemDispositivos = process.env.S3_PREFIXO_IMAGEM_DISPOSITIVOS ?? 'dispositivos';
    this._prefixoImagemPadrao = process.env.S3_PREFIXO_IMAGEM_PADRAO ?? 'padrao';
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
      const { path, queryStringParameters } = data;
      const bucketName = this._bucketResources;
      const objectName = queryStringParameters?.objectName;
      const contentType = queryStringParameters?.contentType;

      if (!objectName || !contentType) {
        throw new Error('Parâmetros objectName e contentType são obrigatórios.');
      }

      const preSignedUrl = await this._s3Proxy.createPreSignedUrlPut(
        bucketName,
        objectName,
        contentType
      );
      return createResult([], 200, JSON.stringify({ uploadUrl: preSignedUrl }));
    } catch (error) {
      console.error('Erro ao gerar URL pré-assinada para upload de imagem:', error);
      throw new Error('Falha ao gerar URL para upload de imagem.');
    }
  }
}
