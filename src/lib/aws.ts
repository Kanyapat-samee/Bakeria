import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const REGION = 'ap-southeast-1'

if (!process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY) {
  console.error('Missing AWS credentials in ENV')
  throw new Error('Missing AWS credentials')
}

export const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  })
)