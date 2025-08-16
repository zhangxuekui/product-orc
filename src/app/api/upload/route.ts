import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from 'next/server';

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://650088cae0176c19567aae3f7c06fa77.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: '350c561137ffdc965cfb9583256049a2',
    secretAccessKey: '20198bbafc6ad53b936bb838239a141d02f369aa2ace8234e7f5f05f2abca02f'
}});

console.log(await S3.send(new ListBucketsCommand({})));
// {
//     '$metadata': {
//     httpStatusCode: 200,
//         requestId: undefined,
//         extendedRequestId: undefined,
//         cfId: undefined,
//         attempts: 1,
//         totalRetryDelay: 0
// },
//     Buckets: [
//     { Name: 'user-uploads', CreationDate: 2022-04-13T21:23:47.102Z },
//     { Name: 'my-bucket-name', CreationDate: 2022-05-07T02:46:49.218Z }
//     ],
//     Owner: {
//         DisplayName: '...',
//         ID: '...'
//     }
// }

console.log(
  await S3.send(new ListObjectsV2Command({ Bucket: "metfo" })),
);
// {
//     '$metadata': {
//       httpStatusCode: 200,
//       requestId: undefined,
//       extendedRequestId: undefined,
//       cfId: undefined,
//       attempts: 1,
//       totalRetryDelay: 0
//     },
//     CommonPrefixes: undefined,
//     Contents: [
//       {
//         Key: 'cat.png',
//         LastModified: 2022-05-07T02:50:45.616Z,
//         ETag: '"c4da329b38467509049e615c11b0c48a"',
//         ChecksumAlgorithm: undefined,
//         Size: 751832,
//         StorageClass: 'STANDARD',
//         Owner: undefined
//       },
//       {
//         Key: 'todos.txt',
//         LastModified: 2022-05-07T21:37:17.150Z,
//         ETag: '"29d911f495d1ba7cb3a4d7d15e63236a"',
//         ChecksumAlgorithm: undefined,
//         Size: 279,
//         StorageClass: 'STANDARD',
//         Owner: undefined
//       }
//     ],
//     ContinuationToken: undefined,
//     Delimiter: undefined,
//     EncodingType: undefined,
//     IsTruncated: false,
//     KeyCount: 8,
//     MaxKeys: 1000,
//     Name: 'my-bucket-name',
//     NextContinuationToken: undefined,
//     Prefix: undefined,
//     StartAfter: undefined
//   }


console.log(await S3.send(new PutObjectCommand({
  Bucket: 'product',
  Key: 'test.txt',
  Body: 'Hello, world!',
})));
// 导入uuid库
import { v4 as uuidv4 } from 'uuid';

//接受前端的文件并上传到product桶
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (file instanceof File) {
    const buffer = await file.arrayBuffer();
    const body = Buffer.from(buffer);
    
    // 生成唯一文件名，保留原始扩展名
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}${fileExtension ? '.' + fileExtension : ''}`;
    
    await S3.send(new PutObjectCommand({
      Bucket: 'product',
      Key: uniqueFileName,
      Body: body,
    }));

    // 构建文件URL（假设使用S3公开访问URL或CloudFront分配）
    const fileUrl = `https://product.s3.amazonaws.com/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      fileName: uniqueFileName,
      fileType: file.type,
      fileSize: file.size
    });
  }
}