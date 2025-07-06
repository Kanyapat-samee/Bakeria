import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { fetchAuthSession } from 'aws-amplify/auth'

const REGION = 'ap-southeast-1'

export async function getDynamoDbDocClient(): Promise<DynamoDBDocumentClient> {
  const session = await fetchAuthSession()
  const creds = session.credentials

  if (!creds) throw new Error('❌ Missing AWS credentials')

  const client = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken, // สำคัญมากถ้าใช้ temporary credentials
    },
  })

  return DynamoDBDocumentClient.from(client)
}