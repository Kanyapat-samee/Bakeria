import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { fetchAuthSession } from 'aws-amplify/auth'

export async function saveOrder({
  items,
  shipping,
  total,
}: {
  items: { id: string; name: string; price: number; quantity: number }[]
  shipping: { name: string; phone: string; address: string; method: string }
  total: number
}) {
  const session = await fetchAuthSession()
  if (!session.credentials) {
    throw new Error('Missing AWS credentials')
  }

  const rawUserId = session.tokens?.idToken?.payload?.name
  const userId =
    typeof rawUserId === 'string' && rawUserId.trim() !== ''
      ? rawUserId.trim()
      : 'guest'

  const client = new DynamoDBClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: session.credentials.accessKeyId,
      secretAccessKey: session.credentials.secretAccessKey,
      sessionToken: session.credentials.sessionToken,
    },
  })

  const orderId = uuidv4()
  const now = new Date()

  const command = new PutItemCommand({
    TableName: 'BakeriaOrders',
    Item: {
      userId: { S: userId },
      orderId: { S: orderId },
      createdAt: { S: now.toISOString() },
      time: { S: format(now, 'HH:mm:ss') },
      total: { N: total.toString() },
      shipping: { S: JSON.stringify(shipping) },
      items: { S: JSON.stringify(items) },
      status: { S: 'Pending' },
    },
  })

  await client.send(command)
  return orderId
}