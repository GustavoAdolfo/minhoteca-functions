export declare class S3Proxy {
    private _repository;
    constructor();
    getDataFromS3File(bucketName: string, keyFile: string): Promise<any>;
    getTextFileFromS3File(bucketName: string, keyFile: string): Promise<string | undefined>;
    createPreSignedUrlPut(bucketName: string, objectName: string, contentType: string): Promise<string>;
    createPreSignedUrlGet(bucketName: string, objectName: string, contentType: string): Promise<string>;
}
//# sourceMappingURL=s3.proxy.d.ts.map