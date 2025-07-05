import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import { fetchAuthSession } from 'aws-amplify/auth'
import { format } from 'date-fns'

// 🔐 Authenticated DynamoDB client using Amplify session
async function getClient() {
  const session = await fetchAuthSession()
  if (!session.credentials) throw new Error('❌ Missing AWS credentials')

  return new DynamoDBClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: session.credentials.accessKeyId,
      secretAccessKey: session.credentials.secretAccessKey,
      sessionToken: session.credentials.sessionToken,
    },
  })
}

// ✅ Save order (partition: userId, sort: orderId)
export async function storeOrder(order: any) {
  const client = await getClient()
  const now = new Date()
  const orderId = order.orderId || crypto.randomUUID()
  const userId = order.userId?.trim() || 'guest'

  const command = new PutItemCommand({
    TableName: 'BakeriaOrders',
    Item: {
      userId: { S: userId },
      orderId: { S: orderId },
      createdAt: { S: now.toISOString() },
      time: { S: format(now, 'HH:mm:ss') },
      total: { N: order.total.toString() },
      shipping: { S: JSON.stringify(order.shipping) },
      items: { S: JSON.stringify(order.items) },
      status: { S: order.status },
    },
  })

  console.log('[📝 Saving Order]', orderId)
  await client.send(command)
  return orderId
}

// ✅ Retrieve specific order using composite key
export async function getOrderById(orderId: string, userId: string) {
  const client = await getClient()

  const command = new GetItemCommand({
    TableName: 'BakeriaOrders',
    Key: {
      userId: { S: userId },
      orderId: { S: orderId },
    },
  })

  const result = await client.send(command)
  if (!result.Item) return null

  return {
    orderId: result.Item.orderId.S,
    userId: result.Item.userId.S,
    items: JSON.parse(result.Item.items.S!),
    shipping: JSON.parse(result.Item.shipping.S!),
    total: Number(result.Item.total.N),
    status: result.Item.status.S,
    createdAt: result.Item.createdAt.S,
    time: result.Item.time?.S || '',
  }
}

// ✅ Get all orders by a single user (userId as partition key)
export async function getOrdersByUserId(userId: string) {
  const client = await getClient()

  const command = new QueryCommand({
    TableName: 'BakeriaOrders',
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: {
      ':uid': { S: userId },
    },
  })

  const result = await client.send(command)

  return (result.Items || []).map((item) => ({
    orderId: item.orderId.S,
    userId: item.userId.S,
    items: JSON.parse(item.items.S!),
    shipping: JSON.parse(item.shipping.S!),
    total: Number(item.total.N),
    status: item.status.S,
    createdAt: item.createdAt.S,
    time: item.time?.S || '',
  }))
}

// ✅ Admin: Get all orders (requires scan)
export async function getAllOrders() {
  const client = await getClient()

  const command = new ScanCommand({
    TableName: 'BakeriaOrders',
  })

  const result = await client.send(command)

  return (result.Items || []).map((item) => ({
    orderId: item.orderId.S,
    userId: item.userId.S,
    items: JSON.parse(item.items.S!),
    shipping: JSON.parse(item.shipping.S!),
    total: Number(item.total.N),
    status: item.status.S,
    createdAt: item.createdAt.S,
    time: item.time?.S || '',
  }))
}