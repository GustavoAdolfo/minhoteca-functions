import { S3Repository } from '@gustavoadolfo/minhoteca-adapter-layer';

export class S3Proxy {
  private _repository: S3Repository;

  constructor() {
    this._repository = new S3Repository();
  }

  async getDataFromS3File(bucketName: string, keyFile: string) {
    return await this._repository.getDataFromS3File(bucketName, keyFile);
  }

  async getTextFileFromS3File(bucketName: string, keyFile: string) {
    return await this._repository.getTextFileFromS3File(bucketName, keyFile);
  }

  async createPreSignedUrlPut(
    bucketName: string,
    objectName: string,
    contentType: string
  ): Promise<string> {
    const forcePathStyle = ['localstack', 'local'].includes(
      process.env.ENVIRONMENT?.toLocaleLowerCase() ?? ''
    );
    return await this._repository.createPreSignedUrlPut(
      bucketName,
      objectName,
      contentType,
      forcePathStyle
    );
  }

  async createPreSignedUrlGet(
    bucketName: string,
    objectName: string,
    contentType: string
  ): Promise<string> {
    const forcePathStyle = ['localstack', 'local'].includes(
      process.env.ENVIRONMENT?.toLocaleLowerCase() ?? ''
    );
    return await this._repository.createPreSignedUrlGet(
      bucketName,
      objectName,
      contentType,
      forcePathStyle
    );
  }
}
