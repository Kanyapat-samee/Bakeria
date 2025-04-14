import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import { fetchAuthSession } from 'aws-amplify/auth'
import { format } from 'date-fns'

type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type ShippingInfo = {
  name: string
  phone: string
  address?: string
  method: 'delivery' | 'pickup'
}

export type OrderPayload = {
  orderId?: string
  userId: string
  items: OrderItem[]
  shipping: ShippingInfo
  total: number
  status: string
  createdAt?: string
  time?: string
}

async function getClient() {
  const session = await fetchAuthSession({ forceRefresh: true })
  if (!session.credentials) throw new Error('Missing AWS credentials')

  return new DynamoDBClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: session.credentials.accessKeyId,
      secretAccessKey: session.credentials.secretAccessKey,
      sessionToken: session.credentials.sessionToken,
    },
  })
}

export async function storeOrder(order: OrderPayload): Promise<string> {
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

  console.log('[Saving Order]', orderId)
  await client.send(command)
  return orderId
}

export async function getOrderById(orderId: string, userId: string): Promise<(OrderPayload & { time: string }) | null> {
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
    orderId: result.Item.orderId.S as string,
    userId: result.Item.userId.S as string,
    items: JSON.parse(result.Item.items.S as string),
    shipping: JSON.parse(result.Item.shipping.S as string),
    total: Number(result.Item.total.N),
    status: result.Item.status.S as string,
    createdAt: result.Item.createdAt.S as string,
    time: result.Item.time?.S || '',
  }
}

export async function getOrdersByUserId(userId: string): Promise<OrderPayload[]> {
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
    orderId: item.orderId.S as string,
    userId: item.userId.S as string,
    items: JSON.parse(item.items.S as string),
    shipping: JSON.parse(item.shipping.S as string),
    total: Number(item.total.N),
    status: item.status.S as string,
    createdAt: item.createdAt.S as string,
    time: item.time?.S || '',
  }))
}

export async function getAllOrders(): Promise<OrderPayload[]> {
  const client = await getClient()

  const command = new ScanCommand({
    TableName: 'BakeriaOrders',
  })

  const result = await client.send(command)

  return (result.Items || []).map((item) => ({
    orderId: item.orderId.S as string,
    userId: item.userId.S as string,
    items: JSON.parse(item.items.S as string),
    shipping: JSON.parse(item.shipping.S as string),
    total: Number(item.total.N),
    status: item.status.S as string,
    createdAt: item.createdAt.S as string,
    time: item.time?.S || '',
  }))
}
