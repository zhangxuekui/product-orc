// src/app/types/r2.d.ts

declare global {
  // R2存储桶绑定类型声明
  // 此类型声明会在Cloudflare Workers环境中自动注入
  const R2_BUCKET: R2Bucket;
}

// R2Bucket接口定义
interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | Blob | Buffer | string,
    options?: R2PutOptions
  ): Promise<R2Object>
  get(key: string): Promise<R2Object | null>
  delete(key: string): Promise<void>
  list(options?: R2ListOptions): Promise<R2Objects>
}

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string
    contentLanguage?: string
    expires?: Date
    cacheControl?: string
    contentDisposition?: string
    contentEncoding?: string
    contentMD5?: string
  }
  customMetadata?: Record<string, string>
  tags?: Record<string, string>
  checksum?: string
  etag?: string
}

interface R2Object {
  key: string
  version: string
  size: number
  etag: string
  httpMetadata: {
    contentType?: string
    contentLanguage?: string
    expires?: Date
    cacheControl?: string
    contentDisposition?: string
    contentEncoding?: string
    contentMD5?: string
  }
  customMetadata: Record<string, string>
  tags: Record<string, string>
  uploaded: Date
  getReader(): ReadableStreamDefaultReader<Uint8Array>
  arrayBuffer(): Promise<ArrayBuffer>
  text(): Promise<string>
}

interface R2ListOptions {
  prefix?: string
  delimiter?: string
  limit?: number
  cursor?: string
  include?: ('httpMetadata' | 'customMetadata' | 'tags')[]
}

interface R2Objects {
  objects: R2Object[]
  truncated: boolean
  cursor?: string
  delimitedPrefixes?: string[]
}

export {}