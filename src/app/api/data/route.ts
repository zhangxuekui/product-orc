import { NextRequest, NextResponse } from 'next/server';
import { withJwtAuth } from '../middleware/jwtAuth';
import imageToBase64 from '../../imageToBase64';


const TencentCloudCommon = require("tencentcloud-sdk-nodejs-common");
const CommonClient = TencentCloudCommon.CommonClient

// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性
// 以下代码示例仅供参考，建议采用更安全的方式来使用密钥
// 请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
  credential: {
    secretId: process.env.TENCENTCLOUD_SECRET_ID,
    secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
  },
  region: "",
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com",
    },
  },
};

const client = new CommonClient(
  "ocr.tencentcloudapi.com",
  "2018-11-19",
  clientConfig
);

// 示例用户数据
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
];

// GET请求处理程序 - 获取OCR识别结果
async function GETHandler(request: NextRequest) {
    try {
      // 转换图片为base64
      // const imageBase64 = await imageToBase64('public/images/unnamed.jpg');
      // console.log(imageBase64);
      const params = {
          // ImageBase64: imageBase64,
          ImageUrl: "https://pic.kuiman.com/unnamed.jpg",
          ItemNames: ["配料信息"],
      };
      
      // 等待腾讯云OCR服务响应
      const data = await client.request("ExtractDocMulti", params);
      console.log(data);
      
      // 返回OCR识别结果
      return NextResponse.json(data);
    } catch (error) {
      console.error('处理失败:', error);
      return NextResponse.json({ error: '处理失败' }, { status: 500 });
    }
}

export const GET = withJwtAuth(GETHandler);
