import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import { fetchAuthSession } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'
import { amplifyAdminConfig } from '@/lib/amplifyAdminConfig'

// ✅ Ensure correct config for admin pool
Amplify.configure(amplifyAdminConfig)

// ✅ Get a DynamoDB client using admin credentials
async function getAdminClient() {
  const session = await fetchAuthSession({ forceRefresh: true })

  // 🔐 Validate session.credentials and accessToken explicitly
  const credentials = session.credentials
  const accessToken = session.tokens?.accessToken?.toString()

  if (!credentials || !accessToken || accessToken.length < 1) {
    console.warn('[getAdminClient] Invalid session or token:', session)
    throw new Error('❌ Missing or invalid AWS credentials / token')
  }

  return new DynamoDBClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  })
}

// ✅ Get all orders (for admin/employee access)
export async function getAllOrders() {
  const client = await getAdminClient()

  const result = await client.send(
    new ScanCommand({
      TableName: 'BakeriaOrders',
    })
  )

  return (result.Items || []).map((item) => ({
    orderId: item.orderId.S!,
    userId: item.userId.S!,
    items: JSON.parse(item.items.S!),
    shipping: JSON.parse(item.shipping.S!),
    total: Number(item.total.N),
    status: item.status.S!,
    createdAt: item.createdAt.S!,
    time: item.time?.S || '',
  }))
}

// ✅ Update a specific order's status
export async function updateOrderStatus(
  userId: string,
  orderId: string,
  status: string
) {
  const client = await getAdminClient()

  const command = new UpdateItemCommand({
    TableName: 'BakeriaOrders',
    Key: {
      userId: { S: userId },
      orderId: { S: orderId },
    },
    UpdateExpression: 'SET #s = :status',
    ExpressionAttributeNames: {
      '#s': 'status',
    },
    ExpressionAttributeValues: {
      ':status': { S: status },
    },
  })

  await client.send(command)
  console.log(`[✅ Updated status] ${orderId} → ${status}`)
}