// ใช้แบบนี้สำหรับ Server (เช่น API route, getServerSideProps)
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const REGION = 'ap-southeast-1'

const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
})

export const db = DynamoDBDocumentClient.from(client)